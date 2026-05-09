import { useState, useEffect, useCallback } from 'react';
import { api } from '../../utils/api';
import Button from '../../components/ui/Button';
import Tag from '../../components/ui/Tag';
import Spinner from '../../components/ui/Spinner';
import './Admin.css';

/* ══════════════════════════════════════════════════════
   AUTH
══════════════════════════════════════════════════════ */
function LoginScreen({ onLogin }) {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async e => {
    e.preventDefault();
    setLoading(true); setError('');
    try { await api.login(login, password); onLogin(); }
    catch { setError('Неверный логин или пароль'); }
    finally { setLoading(false); }
  };

  return (
    <div className="admin-login">
      <div className="admin-login__box">
        <div className="admin-login__logo">
          <span className="admin-login__mark">D</span>
          <span>FORM Admin</span>
        </div>
        <form onSubmit={submit} className="admin-login__form">
          <input className="input" placeholder="Логин" value={login} onChange={e => setLogin(e.target.value)} required />
          <input className="input" type="password" placeholder="Пароль" value={password} onChange={e => setPassword(e.target.value)} required />
          {error && <span className="admin-error">{error}</span>}
          <Button type="submit" size="lg" disabled={loading}>{loading ? <Spinner size="sm" /> : 'Войти'}</Button>
        </form>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   CHARTS
══════════════════════════════════════════════════════ */
const STATUS_MAP = {
  new:         { label: 'Новый',    variant: 'new' },
  in_progress: { label: 'В работе', variant: 'progress' },
  completed:   { label: 'Выполнен', variant: 'done' },
  cancelled:   { label: 'Отменён',  variant: 'cancelled' },
};

function BarChart({ data }) {
  const entries = Object.entries(data).slice(-14);
  const max = Math.max(...entries.map(([, v]) => v), 1);
  return (
    <div className="bar-chart">
      {entries.map(([day, val]) => (
        <div key={day} className="bar-chart__col" title={`${day}: ${val}`}>
          <div className="bar-chart__bar" style={{ height: `${(val / max) * 100}%` }} />
          <span className="bar-chart__label">{day.slice(5)}</span>
        </div>
      ))}
    </div>
  );
}

function DonutChart({ data }) {
  const total = Object.values(data).reduce((a, b) => a + b, 0);
  if (!total) return <p className="admin-empty">Нет данных</p>;
  const colors = { new: '#39c8f4', in_progress: '#f4bc39', completed: '#39f482', cancelled: '#ff5c5c' };
  let offset = 0;
  const segments = Object.entries(data).map(([key, val]) => {
    const pct = (val / total) * 100;
    const seg = { key, val, pct, offset, color: colors[key] };
    offset += pct;
    return seg;
  });
  const r = 40, cx = 50, cy = 50, circum = 2 * Math.PI * r;
  return (
    <div className="donut-wrap">
      <svg viewBox="0 0 100 100" className="donut-svg">
        {segments.map(s => (
          <circle key={s.key} cx={cx} cy={cy} r={r} fill="none" stroke={s.color} strokeWidth="12"
            strokeDasharray={`${(s.pct / 100) * circum} ${circum}`}
            strokeDashoffset={-((s.offset / 100) * circum)}
            transform="rotate(-90 50 50)" />
        ))}
        <text x="50" y="48" textAnchor="middle" className="donut-total">{total}</text>
        <text x="50" y="58" textAnchor="middle" className="donut-label">заказов</text>
      </svg>
      <div className="donut-legend">
        {segments.map(s => (
          <div key={s.key} className="donut-legend__item">
            <span className="donut-legend__dot" style={{ background: s.color }} />
            <span>{STATUS_MAP[s.key]?.label}</span>
            <span className="donut-legend__val">{s.val}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   DASHBOARD TAB
══════════════════════════════════════════════════════ */
function DashboardTab({ analytics }) {
  if (!analytics) return <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><Spinner /></div>;
  const topServices = Object.entries(analytics.by_service || {}).sort((a, b) => b[1] - a[1]).slice(0, 5);
  return (
    <>
      <h1 className="admin-page-title">Дашборд</h1>
      <div className="admin-kpis">
        <div className="kpi-card"><span className="kpi-card__value">{analytics.total_orders}</span><span className="kpi-card__label">Всего заказов</span></div>
        <div className="kpi-card"><span className="kpi-card__value">{analytics.by_status?.new ?? 0}</span><span className="kpi-card__label">Новых</span></div>
        <div className="kpi-card"><span className="kpi-card__value">{analytics.by_status?.in_progress ?? 0}</span><span className="kpi-card__label">В работе</span></div>
        <div className="kpi-card"><span className="kpi-card__value">{analytics.by_status?.completed ?? 0}</span><span className="kpi-card__label">Выполнено</span></div>
      </div>
      <div className="admin-charts">
        <div className="admin-chart-card"><h3>Заказы по дням (14 дней)</h3><BarChart data={analytics.orders_by_day ?? {}} /></div>
        <div className="admin-chart-card"><h3>По статусам</h3><DonutChart data={analytics.by_status ?? {}} /></div>
      </div>
      {topServices.length > 0 && (
        <div className="admin-chart-card admin-chart-card--full">
          <h3>Популярные услуги</h3>
          <div className="services-stats">
            {topServices.map(([svc, count]) => (
              <div key={svc} className="service-stat-row">
                <span className="service-stat-name">{svc}</span>
                <div className="service-stat-bar-wrap"><div className="service-stat-bar" style={{ width: `${(count / topServices[0][1]) * 100}%` }} /></div>
                <span className="service-stat-count">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

/* ══════════════════════════════════════════════════════
   ORDERS TAB
══════════════════════════════════════════════════════ */
function OrdersTab({ orders, onStatusChange }) {
  const [filterStatus, setFilterStatus] = useState('all');
  const filtered = filterStatus === 'all' ? orders : orders.filter(o => o.status === filterStatus);
  return (
    <>
      <div className="admin-orders-header">
        <h1 className="admin-page-title">Заказы</h1>
        <div className="admin-filter">
          {['all', 'new', 'in_progress', 'completed', 'cancelled'].map(s => (
            <button key={s} className={`filter-btn ${filterStatus === s ? 'filter-btn--active' : ''}`} onClick={() => setFilterStatus(s)}>
              {s === 'all' ? 'Все' : STATUS_MAP[s]?.label}
            </button>
          ))}
        </div>
      </div>
      {filtered.length === 0 ? <p className="admin-empty">Нет заказов</p> : (
        <div className="orders-table-wrap">
          <table className="orders-table">
            <thead><tr><th>Дата</th><th>Клиент</th><th>Услуга</th><th>Бюджет</th><th>Статус</th><th>Действие</th></tr></thead>
            <tbody>
              {filtered.map(order => (
                <tr key={order.id}>
                  <td className="orders-table__date">{new Date(order.created_at).toLocaleDateString('ru-RU')}</td>
                  <td><div className="orders-table__client"><strong>{order.name}</strong><span>{order.email}</span></div></td>
                  <td>{order.service}</td>
                  <td className="orders-table__muted">{order.budget || '—'}</td>
                  <td><Tag variant={STATUS_MAP[order.status]?.variant}>{STATUS_MAP[order.status]?.label}</Tag></td>
                  <td>
                    <select className="select" style={{ padding: '6px 32px 6px 10px', fontSize: 12 }} value={order.status} onChange={e => onStatusChange(order.id, e.target.value)}>
                      {Object.entries(STATUS_MAP).map(([val, { label }]) => <option key={val} value={val}>{label}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

/* ══════════════════════════════════════════════════════
   SHARED: CMS FORM HELPERS
══════════════════════════════════════════════════════ */
function CmsField({ label, children }) {
  return (
    <div className="cms-field">
      <label className="cms-field__label">{label}</label>
      {children}
    </div>
  );
}

function CmsActions({ onSave, onCancel, saving }) {
  return (
    <div className="cms-form-actions">
      <Button size="sm" onClick={onSave} disabled={saving}>{saving ? <Spinner size="sm" /> : 'Сохранить'}</Button>
      <Button size="sm" variant="outline" onClick={onCancel}>Отмена</Button>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   PORTFOLIO TAB
══════════════════════════════════════════════════════ */
const PORTFOLIO_BLANK = { id: '', title: '', category: '', client: '', year: '2024', description: '', tags: '', color: '#7B5EA7', dur: '', del: '', res: '' };

function PortfolioTab() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState(null); // null | 'new' | item.id
  const [form, setForm] = useState(PORTFOLIO_BLANK);
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    api.getPortfolio().then(d => { setItems(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  useEffect(load, [load]);

  const toForm = item => ({
    id: item.id, title: item.title, category: item.category, client: item.client,
    year: item.year, description: item.description,
    tags: Array.isArray(item.tags) ? item.tags.join(', ') : '',
    color: item.color || '#7B5EA7',
    dur: item.stats?.duration || '', del: item.stats?.deliverables || '', res: item.stats?.result || '',
  });

  const fromForm = f => ({
    id: f.id, title: f.title, category: f.category, client: f.client,
    year: f.year, description: f.description,
    tags: f.tags.split(',').map(t => t.trim()).filter(Boolean),
    color: f.color,
    stats: { duration: f.dur, deliverables: f.del, result: f.res },
  });

  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const data = fromForm(form);
      if (editId === 'new') await api.createPortfolioItem(data);
      else await api.updatePortfolioItem(editId, data);
      setEditId(null);
      load();
    } finally { setSaving(false); }
  };

  const handleDelete = async id => {
    if (!window.confirm('Удалить проект?')) return;
    await api.deletePortfolioItem(id);
    load();
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><Spinner /></div>;

  return (
    <>
      <div className="cms-section-header">
        <h1 className="admin-page-title">Портфолио</h1>
        {editId === null && <Button size="sm" onClick={() => { setForm(PORTFOLIO_BLANK); setEditId('new'); }}>+ Добавить проект</Button>}
      </div>

      {editId !== null && (
        <div className="cms-form-card">
          <h3 className="cms-form-title">{editId === 'new' ? 'Новый проект' : 'Редактирование проекта'}</h3>
          <div className="cms-form-grid">
            <CmsField label="ID (slug)"><input className="input" value={form.id} onChange={set('id')} placeholder="nova-brand" /></CmsField>
            <CmsField label="Название"><input className="input" value={form.title} onChange={set('title')} placeholder="Nova Brand Identity" /></CmsField>
            <CmsField label="Категория"><input className="input" value={form.category} onChange={set('category')} placeholder="Брендинг" /></CmsField>
            <CmsField label="Клиент"><input className="input" value={form.client} onChange={set('client')} placeholder="Nova Tech" /></CmsField>
            <CmsField label="Год"><input className="input" value={form.year} onChange={set('year')} placeholder="2024" /></CmsField>
            <CmsField label="Цвет акцента"><input className="input" type="color" value={form.color} onChange={set('color')} /></CmsField>
            <CmsField label="Описание (полная строка)"><textarea className="textarea" value={form.description} onChange={set('description')} rows={3} /></CmsField>
            <CmsField label="Теги (через запятую)"><input className="input" value={form.tags} onChange={set('tags')} placeholder="Брендинг, Логотип" /></CmsField>
            <CmsField label="Длительность"><input className="input" value={form.dur} onChange={set('dur')} placeholder="6 недель" /></CmsField>
            <CmsField label="Результаты / материалы"><input className="input" value={form.del} onChange={set('del')} placeholder="48 файлов" /></CmsField>
            <CmsField label="Итог"><input className="input" value={form.res} onChange={set('res')} placeholder="+340% узнаваемости" /></CmsField>
          </div>
          <CmsActions onSave={handleSave} onCancel={() => setEditId(null)} saving={saving} />
        </div>
      )}

      {items.length === 0 ? <p className="admin-empty">Нет проектов</p> : (
        <div className="cms-table-wrap">
          <table className="orders-table">
            <thead><tr><th>Проект</th><th>Категория</th><th>Клиент</th><th>Год</th><th></th></tr></thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ width: 12, height: 12, borderRadius: '50%', background: item.color, flexShrink: 0 }} />
                      {item.title}
                    </div>
                  </td>
                  <td>{item.category}</td>
                  <td>{item.client}</td>
                  <td>{item.year}</td>
                  <td className="cms-row-actions">
                    <button className="cms-btn-edit" onClick={() => { setForm(toForm(item)); setEditId(item.id); }}>Изменить</button>
                    <button className="cms-btn-del" onClick={() => handleDelete(item.id)}>Удалить</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

/* ══════════════════════════════════════════════════════
   SERVICES TAB
══════════════════════════════════════════════════════ */
const SERVICES_BLANK = { id: '', icon: '◈', title: '', description: '', features: '', price: '', duration: '' };

function ServicesTab() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(SERVICES_BLANK);
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    api.getServices().then(d => { setItems(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  useEffect(load, [load]);

  const toForm = item => ({ ...item, features: Array.isArray(item.features) ? item.features.join('\n') : '' });
  const fromForm = f => ({ ...f, features: f.features.split('\n').map(s => s.trim()).filter(Boolean) });
  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const data = fromForm(form);
      if (editId === 'new') await api.createService(data);
      else await api.updateService(editId, data);
      setEditId(null); load();
    } finally { setSaving(false); }
  };

  const handleDelete = async id => {
    if (!window.confirm('Удалить услугу?')) return;
    await api.deleteService(id); load();
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><Spinner /></div>;

  return (
    <>
      <div className="cms-section-header">
        <h1 className="admin-page-title">Услуги</h1>
        {editId === null && <Button size="sm" onClick={() => { setForm(SERVICES_BLANK); setEditId('new'); }}>+ Добавить услугу</Button>}
      </div>

      {editId !== null && (
        <div className="cms-form-card">
          <h3 className="cms-form-title">{editId === 'new' ? 'Новая услуга' : 'Редактирование услуги'}</h3>
          <div className="cms-form-grid">
            <CmsField label="ID (slug)"><input className="input" value={form.id} onChange={set('id')} placeholder="branding" /></CmsField>
            <CmsField label="Иконка"><input className="input" value={form.icon} onChange={set('icon')} placeholder="◈" /></CmsField>
            <CmsField label="Название"><input className="input" value={form.title} onChange={set('title')} placeholder="Брендинг" /></CmsField>
            <CmsField label="Цена"><input className="input" value={form.price} onChange={set('price')} placeholder="от 80 000 ₽" /></CmsField>
            <CmsField label="Срок"><input className="input" value={form.duration} onChange={set('duration')} placeholder="4–8 недель" /></CmsField>
            <CmsField label="Описание"><textarea className="textarea" value={form.description} onChange={set('description')} rows={3} /></CmsField>
            <CmsField label="Включает (каждый пункт с новой строки)"><textarea className="textarea" value={form.features} onChange={set('features')} rows={5} placeholder={"Логотип и знак\nФирменный стиль\nБрендбук"} /></CmsField>
          </div>
          <CmsActions onSave={handleSave} onCancel={() => setEditId(null)} saving={saving} />
        </div>
      )}

      {items.length === 0 ? <p className="admin-empty">Нет услуг</p> : (
        <div className="cms-table-wrap">
          <table className="orders-table">
            <thead><tr><th>Услуга</th><th>Цена</th><th>Срок</th><th></th></tr></thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id}>
                  <td><span style={{ marginRight: 8 }}>{item.icon}</span>{item.title}</td>
                  <td>{item.price}</td>
                  <td>{item.duration}</td>
                  <td className="cms-row-actions">
                    <button className="cms-btn-edit" onClick={() => { setForm(toForm(item)); setEditId(item.id); }}>Изменить</button>
                    <button className="cms-btn-del" onClick={() => handleDelete(item.id)}>Удалить</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

/* ══════════════════════════════════════════════════════
   TEAM TAB
══════════════════════════════════════════════════════ */
const TEAM_BLANK = { name: '', role: '', bio: '', initials: '', color: '#7B5EA7' };

function TeamTab() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(TEAM_BLANK);
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    api.getTeam().then(d => { setItems(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  useEffect(load, [load]);
  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editId === 'new') await api.createTeamMember(form);
      else await api.updateTeamMember(editId, form);
      setEditId(null); load();
    } finally { setSaving(false); }
  };

  const handleDelete = async id => {
    if (!window.confirm('Удалить участника?')) return;
    await api.deleteTeamMember(id); load();
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><Spinner /></div>;

  return (
    <>
      <div className="cms-section-header">
        <h1 className="admin-page-title">Команда</h1>
        {editId === null && <Button size="sm" onClick={() => { setForm(TEAM_BLANK); setEditId('new'); }}>+ Добавить участника</Button>}
      </div>

      {editId !== null && (
        <div className="cms-form-card">
          <h3 className="cms-form-title">{editId === 'new' ? 'Новый участник' : 'Редактирование участника'}</h3>
          <div className="cms-form-grid">
            <CmsField label="Имя"><input className="input" value={form.name} onChange={set('name')} placeholder="Алина Серова" /></CmsField>
            <CmsField label="Должность"><input className="input" value={form.role} onChange={set('role')} placeholder="Art Director" /></CmsField>
            <CmsField label="Инициалы"><input className="input" value={form.initials} onChange={set('initials')} placeholder="АС" /></CmsField>
            <CmsField label="Цвет аватара"><input className="input" type="color" value={form.color} onChange={set('color')} /></CmsField>
            <CmsField label="Биография"><textarea className="textarea" value={form.bio} onChange={set('bio')} rows={3} /></CmsField>
          </div>
          <CmsActions onSave={handleSave} onCancel={() => setEditId(null)} saving={saving} />
        </div>
      )}

      <div className="team-cms-grid">
        {items.map(person => (
          <div key={person.id} className="team-cms-card">
            <div className="team-cms-card__avatar" style={{ background: `${person.color}22`, color: person.color }}>
              {person.initials}
            </div>
            <div className="team-cms-card__info">
              <strong>{person.name}</strong>
              <span>{person.role}</span>
              <p>{person.bio}</p>
            </div>
            <div className="team-cms-card__actions">
              <button className="cms-btn-edit" onClick={() => { setForm({ name: person.name, role: person.role, bio: person.bio, initials: person.initials, color: person.color }); setEditId(person.id); }}>Изменить</button>
              <button className="cms-btn-del" onClick={() => handleDelete(person.id)}>Удалить</button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

/* ══════════════════════════════════════════════════════
   SITE TAB — sub-sections for site.json content
══════════════════════════════════════════════════════ */
function SiteTab() {
  const [site, setSite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [section, setSection] = useState('hero');

  const load = useCallback(() => {
    setLoading(true);
    api.getSite().then(d => { setSite(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  useEffect(load, [load]);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><Spinner /></div>;

  const SITE_SECTIONS = [
    ['hero', 'Главный экран'],
    ['about_story', 'О студии'],
    ['cta', 'CTA блок'],
    ['footer', 'Футер'],
    ['clients', 'Клиенты'],
    ['stats', 'Статистика'],
    ['values', 'Ценности'],
    ['contacts', 'Контакты'],
    ['social', 'Соцсети'],
  ];

  return (
    <>
      <h1 className="admin-page-title">Настройки сайта</h1>
      <div className="site-tabs">
        {SITE_SECTIONS.map(([id, label]) => (
          <button key={id} className={`site-tab-btn ${section === id ? 'site-tab-btn--active' : ''}`} onClick={() => setSection(id)}>
            {label}
          </button>
        ))}
      </div>

      <div className="site-section-body">
        {section === 'hero'        && <SiteHero site={site} onSave={load} />}
        {section === 'about_story' && <SiteAbout site={site} onSave={load} />}
        {section === 'cta'         && <SiteCta site={site} onSave={load} />}
        {section === 'footer'      && <SiteFooter site={site} onSave={load} />}
        {section === 'clients'     && <SiteStringList siteKey="clients" site={site} onSave={load} title="Клиенты" />}
        {section === 'stats'       && <SiteStats site={site} onSave={load} />}
        {section === 'values'      && <SiteValues site={site} onSave={load} />}
        {section === 'contacts'    && <SiteContacts site={site} onSave={load} />}
        {section === 'social'      && <SiteSocial site={site} onSave={load} />}
      </div>
    </>
  );
}

/* ── Site: Hero ─────────────────────────────────────── */
function SiteHero({ site, onSave }) {
  const h = site?.hero || {};
  const [form, setForm] = useState({ label: h.label || '', title_line1: h.title_line1 || '', title_accent: h.title_accent || '', title_line2: h.title_line2 || '', title_line3: h.title_line3 || '', description: h.description || '' });
  const [saving, setSaving] = useState(false);
  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSave = async () => {
    setSaving(true);
    try { await api.updateSiteSection('hero', form); onSave(); }
    finally { setSaving(false); }
  };

  return (
    <div className="cms-form-card">
      <h3 className="cms-form-title">Главный экран (Hero)</h3>
      <div className="cms-form-grid">
        <CmsField label="Подзаголовок / лейбл"><input className="input" value={form.label} onChange={set('label')} placeholder="Дизайн-студия · Черкесск" /></CmsField>
        <CmsField label="Строка 1 заголовка"><input className="input" value={form.title_line1} onChange={set('title_line1')} /></CmsField>
        <CmsField label="Акцентное слово"><input className="input" value={form.title_accent} onChange={set('title_accent')} /></CmsField>
        <CmsField label="Строка 2 заголовка"><input className="input" value={form.title_line2} onChange={set('title_line2')} /></CmsField>
        <CmsField label="Строка 3 заголовка"><input className="input" value={form.title_line3} onChange={set('title_line3')} /></CmsField>
        <CmsField label="Описание"><textarea className="textarea" value={form.description} onChange={set('description')} rows={3} /></CmsField>
      </div>
      <CmsActions onSave={handleSave} onCancel={() => {}} saving={saving} />
    </div>
  );
}

/* ── Site: About Story ───────────────────────────────── */
function SiteAbout({ site, onSave }) {
  const a = site?.about_story || {};
  const [title, setTitle] = useState(a.title || '');
  const [paragraphs, setParagraphs] = useState((a.paragraphs || []).join('\n\n'));
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.updateSiteSection('about_story', {
        title,
        paragraphs: paragraphs.split('\n\n').map(p => p.trim()).filter(Boolean),
      });
      onSave();
    } finally { setSaving(false); }
  };

  return (
    <div className="cms-form-card">
      <h3 className="cms-form-title">История студии</h3>
      <div className="cms-form-grid">
        <CmsField label="Заголовок раздела"><input className="input" value={title} onChange={e => setTitle(e.target.value)} /></CmsField>
        <CmsField label="Параграфы (разделяйте двойным переносом строки)">
          <textarea className="textarea" value={paragraphs} onChange={e => setParagraphs(e.target.value)} rows={10} />
        </CmsField>
      </div>
      <CmsActions onSave={handleSave} onCancel={() => {}} saving={saving} />
    </div>
  );
}

/* ── Site: CTA ───────────────────────────────────────── */
function SiteCta({ site, onSave }) {
  const c = site?.cta || {};
  const [form, setForm] = useState({ tag: c.tag || '', title: c.title || '', description: c.description || '' });
  const [saving, setSaving] = useState(false);
  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSave = async () => {
    setSaving(true);
    try { await api.updateSiteSection('cta', form); onSave(); }
    finally { setSaving(false); }
  };

  return (
    <div className="cms-form-card">
      <h3 className="cms-form-title">CTA блок</h3>
      <div className="cms-form-grid">
        <CmsField label="Тег / подзаголовок"><input className="input" value={form.tag} onChange={set('tag')} /></CmsField>
        <CmsField label="Заголовок (\\n для переноса строки)"><input className="input" value={form.title} onChange={set('title')} /></CmsField>
        <CmsField label="Описание"><textarea className="textarea" value={form.description} onChange={set('description')} rows={3} /></CmsField>
      </div>
      <CmsActions onSave={handleSave} onCancel={() => {}} saving={saving} />
    </div>
  );
}

/* ── Site: Footer ────────────────────────────────────── */
function SiteFooter({ site, onSave }) {
  const f = site?.footer || {};
  const [form, setForm] = useState({ tagline: f.tagline || '', copyright: f.copyright || '' });
  const [saving, setSaving] = useState(false);
  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSave = async () => {
    setSaving(true);
    try { await api.updateSiteSection('footer', form); onSave(); }
    finally { setSaving(false); }
  };

  return (
    <div className="cms-form-card">
      <h3 className="cms-form-title">Футер</h3>
      <div className="cms-form-grid">
        <CmsField label="Слоган"><input className="input" value={form.tagline} onChange={set('tagline')} /></CmsField>
        <CmsField label="Копирайт"><input className="input" value={form.copyright} onChange={set('copyright')} /></CmsField>
      </div>
      <CmsActions onSave={handleSave} onCancel={() => {}} saving={saving} />
    </div>
  );
}

/* ── Site: Clients (string list) ─────────────────────── */
function SiteStringList({ siteKey, site, onSave }) {
  const [items, setItems] = useState(site?.[siteKey] || []);
  const [newVal, setNewVal] = useState('');
  const [saving, setSaving] = useState(false);

  const handleAdd = async () => {
    if (!newVal.trim()) return;
    setSaving(true);
    try { await api.addSiteListItem(siteKey, newVal.trim()); setNewVal(''); onSave(); }
    finally { setSaving(false); }
  };

  const handleDelete = async idx => {
    if (!window.confirm('Удалить?')) return;
    await api.deleteSiteListItem(siteKey, idx); onSave();
  };

  useEffect(() => { setItems(site?.[siteKey] || []); }, [site, siteKey]);

  return (
    <div className="cms-form-card">
      <h3 className="cms-form-title">Клиенты студии</h3>
      <div className="cms-string-list">
        {items.map((item, i) => (
          <div key={i} className="cms-string-item">
            <span>{item}</span>
            <button className="cms-btn-del" onClick={() => handleDelete(i)}>✕</button>
          </div>
        ))}
      </div>
      <div className="cms-add-row">
        <input className="input" value={newVal} onChange={e => setNewVal(e.target.value)} placeholder="Название компании" onKeyDown={e => e.key === 'Enter' && handleAdd()} />
        <Button size="sm" onClick={handleAdd} disabled={saving}>Добавить</Button>
      </div>
    </div>
  );
}

/* ── Site: Stats ─────────────────────────────────────── */
function SiteStats({ site, onSave }) {
  const [items, setItems] = useState(site?.stats || []);
  const [editIdx, setEditIdx] = useState(null);
  const [form, setForm] = useState({ value: '', label: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => { setItems(site?.stats || []); }, [site]);

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editIdx === -1) await api.addSiteListItem('stats', form);
      else await api.updateSiteListItem('stats', editIdx, form);
      setEditIdx(null); onSave();
    } finally { setSaving(false); }
  };

  const handleDelete = async idx => {
    if (!window.confirm('Удалить?')) return;
    await api.deleteSiteListItem('stats', idx); onSave();
  };

  return (
    <div className="cms-form-card">
      <div className="cms-section-header" style={{ marginBottom: 16 }}>
        <h3 className="cms-form-title" style={{ margin: 0 }}>Цифры / статистика</h3>
        {editIdx === null && <Button size="sm" onClick={() => { setForm({ value: '', label: '' }); setEditIdx(-1); }}>+ Добавить</Button>}
      </div>

      {editIdx !== null && (
        <div style={{ background: 'var(--color-bg)', borderRadius: 8, padding: 16, marginBottom: 16 }}>
          <div className="cms-form-grid">
            <CmsField label="Значение"><input className="input" value={form.value} onChange={e => setForm(p => ({ ...p, value: e.target.value }))} placeholder="127" /></CmsField>
            <CmsField label="Подпись"><input className="input" value={form.label} onChange={e => setForm(p => ({ ...p, label: e.target.value }))} placeholder="Проектов выполнено" /></CmsField>
          </div>
          <CmsActions onSave={handleSave} onCancel={() => setEditIdx(null)} saving={saving} />
        </div>
      )}

      <div className="cms-stats-grid">
        {items.map((item, i) => (
          <div key={i} className="cms-stat-card">
            <span className="cms-stat-value">{item.value}</span>
            <span className="cms-stat-label">{item.label}</span>
            <div className="cms-stat-actions">
              <button className="cms-btn-edit" onClick={() => { setForm({ value: item.value, label: item.label }); setEditIdx(i); }}>Изм.</button>
              <button className="cms-btn-del" onClick={() => handleDelete(i)}>✕</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Site: Values ────────────────────────────────────── */
function SiteValues({ site, onSave }) {
  const [items, setItems] = useState(site?.values || []);
  const [editIdx, setEditIdx] = useState(null);
  const [form, setForm] = useState({ icon: '◈', title: '', desc: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => { setItems(site?.values || []); }, [site]);

  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editIdx === -1) await api.addSiteListItem('values', form);
      else await api.updateSiteListItem('values', editIdx, form);
      setEditIdx(null); onSave();
    } finally { setSaving(false); }
  };

  const handleDelete = async idx => {
    if (!window.confirm('Удалить?')) return;
    await api.deleteSiteListItem('values', idx); onSave();
  };

  return (
    <div className="cms-form-card">
      <div className="cms-section-header" style={{ marginBottom: 16 }}>
        <h3 className="cms-form-title" style={{ margin: 0 }}>Ценности студии</h3>
        {editIdx === null && <Button size="sm" onClick={() => { setForm({ icon: '◈', title: '', desc: '' }); setEditIdx(-1); }}>+ Добавить</Button>}
      </div>

      {editIdx !== null && (
        <div style={{ background: 'var(--color-bg)', borderRadius: 8, padding: 16, marginBottom: 16 }}>
          <div className="cms-form-grid">
            <CmsField label="Иконка"><input className="input" value={form.icon} onChange={set('icon')} /></CmsField>
            <CmsField label="Заголовок"><input className="input" value={form.title} onChange={set('title')} /></CmsField>
            <CmsField label="Описание"><textarea className="textarea" value={form.desc} onChange={set('desc')} rows={3} /></CmsField>
          </div>
          <CmsActions onSave={handleSave} onCancel={() => setEditIdx(null)} saving={saving} />
        </div>
      )}

      <div className="cms-table-wrap">
        <table className="orders-table">
          <thead><tr><th>Иконка</th><th>Заголовок</th><th>Описание</th><th></th></tr></thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={i}>
                <td>{item.icon}</td>
                <td>{item.title}</td>
                <td style={{ maxWidth: 300, fontSize: 13, color: 'var(--color-muted)' }}>{item.desc}</td>
                <td className="cms-row-actions">
                  <button className="cms-btn-edit" onClick={() => { setForm({ icon: item.icon, title: item.title, desc: item.desc }); setEditIdx(i); }}>Изменить</button>
                  <button className="cms-btn-del" onClick={() => handleDelete(i)}>Удалить</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ── Site: Contacts ──────────────────────────────────── */
function SiteContacts({ site, onSave }) {
  const [items, setItems] = useState(site?.contacts || []);
  const [editIdx, setEditIdx] = useState(null);
  const [form, setForm] = useState({ icon: '◎', label: '', value: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => { setItems(site?.contacts || []); }, [site]);
  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editIdx === -1) await api.addSiteListItem('contacts', form);
      else await api.updateSiteListItem('contacts', editIdx, form);
      setEditIdx(null); onSave();
    } finally { setSaving(false); }
  };

  const handleDelete = async idx => {
    if (!window.confirm('Удалить?')) return;
    await api.deleteSiteListItem('contacts', idx); onSave();
  };

  return (
    <div className="cms-form-card">
      <div className="cms-section-header" style={{ marginBottom: 16 }}>
        <h3 className="cms-form-title" style={{ margin: 0 }}>Контактная информация</h3>
        {editIdx === null && <Button size="sm" onClick={() => { setForm({ icon: '◎', label: '', value: '' }); setEditIdx(-1); }}>+ Добавить</Button>}
      </div>

      {editIdx !== null && (
        <div style={{ background: 'var(--color-bg)', borderRadius: 8, padding: 16, marginBottom: 16 }}>
          <div className="cms-form-grid">
            <CmsField label="Иконка"><input className="input" value={form.icon} onChange={set('icon')} /></CmsField>
            <CmsField label="Подпись"><input className="input" value={form.label} onChange={set('label')} placeholder="Email" /></CmsField>
            <CmsField label="Значение"><input className="input" value={form.value} onChange={set('value')} placeholder="hello@dform.studio" /></CmsField>
          </div>
          <CmsActions onSave={handleSave} onCancel={() => setEditIdx(null)} saving={saving} />
        </div>
      )}

      <div className="cms-table-wrap">
        <table className="orders-table">
          <thead><tr><th>Иконка</th><th>Подпись</th><th>Значение</th><th></th></tr></thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={i}>
                <td>{item.icon}</td>
                <td>{item.label}</td>
                <td>{item.value}</td>
                <td className="cms-row-actions">
                  <button className="cms-btn-edit" onClick={() => { setForm({ icon: item.icon, label: item.label, value: item.value }); setEditIdx(i); }}>Изменить</button>
                  <button className="cms-btn-del" onClick={() => handleDelete(i)}>Удалить</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ── Site: Social ────────────────────────────────────── */
function SiteSocial({ site, onSave }) {
  const [items, setItems] = useState(site?.social || []);
  const [editIdx, setEditIdx] = useState(null);
  const [form, setForm] = useState({ platform: '', url: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => { setItems(site?.social || []); }, [site]);
  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editIdx === -1) await api.addSiteListItem('social', form);
      else await api.updateSiteListItem('social', editIdx, form);
      setEditIdx(null); onSave();
    } finally { setSaving(false); }
  };

  const handleDelete = async idx => {
    if (!window.confirm('Удалить?')) return;
    await api.deleteSiteListItem('social', idx); onSave();
  };

  return (
    <div className="cms-form-card">
      <div className="cms-section-header" style={{ marginBottom: 16 }}>
        <h3 className="cms-form-title" style={{ margin: 0 }}>Социальные сети</h3>
        {editIdx === null && <Button size="sm" onClick={() => { setForm({ platform: '', url: '' }); setEditIdx(-1); }}>+ Добавить</Button>}
      </div>

      {editIdx !== null && (
        <div style={{ background: 'var(--color-bg)', borderRadius: 8, padding: 16, marginBottom: 16 }}>
          <div className="cms-form-grid">
            <CmsField label="Платформа"><input className="input" value={form.platform} onChange={set('platform')} placeholder="Instagram" /></CmsField>
            <CmsField label="Ссылка"><input className="input" value={form.url} onChange={set('url')} placeholder="https://instagram.com/dform" /></CmsField>
          </div>
          <CmsActions onSave={handleSave} onCancel={() => setEditIdx(null)} saving={saving} />
        </div>
      )}

      <div className="cms-table-wrap">
        <table className="orders-table">
          <thead><tr><th>Платформа</th><th>Ссылка</th><th></th></tr></thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={i}>
                <td>{item.platform}</td>
                <td style={{ fontSize: 13, color: 'var(--color-muted)' }}>{item.url}</td>
                <td className="cms-row-actions">
                  <button className="cms-btn-edit" onClick={() => { setForm({ platform: item.platform, url: item.url }); setEditIdx(i); }}>Изменить</button>
                  <button className="cms-btn-del" onClick={() => handleDelete(i)}>Удалить</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   MAIN DASHBOARD (shell with sidebar)
══════════════════════════════════════════════════════ */
const NAV_ITEMS = [
  ['dashboard',  '◈ Дашборд'],
  ['orders',     '◻ Заказы'],
  ['portfolio',  '▣ Портфолио'],
  ['services',   '◇ Услуги'],
  ['team',       '◉ Команда'],
  ['site',       '◪ Настройки сайта'],
];

function AdminShell({ onLogout }) {
  const [tab, setTab] = useState('dashboard');
  const [analytics, setAnalytics] = useState(null);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    Promise.all([api.getAnalytics(), api.getOrders()])
      .then(([a, o]) => { setAnalytics(a); setOrders(o); })
      .catch(() => {});
  }, []);

  const handleStatusChange = async (id, status) => {
    try {
      await api.updateOrderStatus(id, status);
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
      const a = await api.getAnalytics();
      setAnalytics(a);
    } catch {}
  };

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar__logo">
          <span className="admin-login__mark">D</span>
          <span>FORM Admin</span>
        </div>
        <nav className="admin-nav">
          {NAV_ITEMS.map(([id, label]) => (
            <button key={id} className={`admin-nav__item ${tab === id ? 'admin-nav__item--active' : ''}`} onClick={() => setTab(id)}>
              {label}
            </button>
          ))}
        </nav>
        <button className="admin-nav__item admin-nav__logout" onClick={onLogout}>◇ Выйти</button>
      </aside>

      <main className="admin-main">
        {tab === 'dashboard'  && <DashboardTab analytics={analytics} />}
        {tab === 'orders'     && <OrdersTab orders={orders} onStatusChange={handleStatusChange} />}
        {tab === 'portfolio'  && <PortfolioTab />}
        {tab === 'services'   && <ServicesTab />}
        {tab === 'team'       && <TeamTab />}
        {tab === 'site'       && <SiteTab />}
      </main>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   ROOT
══════════════════════════════════════════════════════ */
export default function Admin() {
  const [authed, setAuthed] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.checkAuth()
      .then(d => setAuthed(d.authenticated))
      .catch(() => setAuthed(false))
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = async () => {
    await api.logout().catch(() => {});
    setAuthed(false);
  };

  if (loading) return <div className="admin-loading"><Spinner size="lg" /></div>;
  if (!authed) return <LoginScreen onLogin={() => setAuthed(true)} />;
  return <AdminShell onLogout={handleLogout} />;
}
