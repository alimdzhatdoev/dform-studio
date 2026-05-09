import { Link } from 'react-router-dom';
import SectionTitle from '../../components/ui/SectionTitle';
import Button from '../../components/ui/Button';
import Tag from '../../components/ui/Tag';
import { useApi } from '../../hooks/useApi';
import { useSite } from '../../context/SiteContext';
import { api } from '../../utils/api';
import './Home.css';

function Hero({ hero }) {
  if (!hero) return null;
  return (
    <section className="hero">
      <div className="hero__bg-text" aria-hidden>DFORM</div>
      <div className="container hero__content">
        <div className="hero__label">
          <span className="hero__dot" />
          {hero.label || 'Дизайн-студия · Черкесск'}
        </div>
        <h1 className="hero__title">
          {hero.title_line1 || 'Мы создаём'}<br />
          <span className="hero__title-accent">{hero.title_accent || 'дизайн'}</span>{hero.title_line2 || ', который'}<br />
          {hero.title_line3 || 'работает'}
        </h1>
        <p className="hero__desc">
          {hero.description || 'Брендинг, веб-дизайн, упаковка и моушн-графика для компаний, которые хотят выглядеть лучше конкурентов.'}
        </p>
        <div className="hero__actions">
          <Button as={Link} to="/order" size="lg">Начать проект</Button>
          <Button as={Link} to="/portfolio" variant="outline" size="lg">Смотреть работы</Button>
        </div>
      </div>
      <div className="hero__scroll-hint" aria-hidden>
        <span>Scroll</span>
        <span className="hero__scroll-line" />
      </div>
    </section>
  );
}

function StatsSection({ stats }) {
  if (!stats?.length) return null;
  return (
    <section className="stats-section">
      <div className="container">
        <div className="stats-grid">
          {stats.map(({ value, label }) => (
            <div key={label} className="stat-item">
              <span className="stat-value">{value}</span>
              <span className="stat-label">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function WorkPreview({ portfolio }) {
  const featured = (portfolio || []).slice(0, 3);
  if (!featured.length) return null;
  return (
    <section className="work-preview">
      <div className="container">
        <div className="section-header">
          <SectionTitle
            label="Избранные работы"
            title="Проекты, которыми мы гордимся"
          />
          <Button as={Link} to="/portfolio" variant="outline">Все работы →</Button>
        </div>
        <div className="work-grid">
          {featured.map((project, i) => (
            <Link
              key={project.id}
              to={`/portfolio/${project.id}`}
              className={`work-card ${i === 0 ? 'work-card--featured' : ''}`}
            >
              <div
                className="work-card__image"
                style={{ background: `linear-gradient(135deg, ${project.color}22 0%, ${project.color}44 100%)` }}
              >
                <div className="work-card__image-inner" style={{ color: project.color }}>
                  {project.title[0]}
                </div>
              </div>
              <div className="work-card__info">
                <div className="work-card__meta">
                  <Tag>{project.category}</Tag>
                  <span className="work-card__year">{project.year}</span>
                </div>
                <h3 className="work-card__title">{project.title}</h3>
                <p className="work-card__client">{project.client}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function ServicesPreview({ services }) {
  if (!services?.length) return null;
  return (
    <section className="services-preview">
      <div className="container">
        <SectionTitle
          label="Что мы делаем"
          title="Услуги студии"
          subtitle="Комплексные решения для вашего бизнеса — от идеи до готового продукта"
        />
        <div className="services-list">
          {services.map((service, i) => (
            <Link key={service.id} to="/services" className="service-row">
              <span className="service-row__num">0{i + 1}</span>
              <span className="service-row__icon">{service.icon}</span>
              <span className="service-row__title">{service.title}</span>
              <span className="service-row__price">{service.price}</span>
              <span className="service-row__arrow">→</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function ClientsSection({ clients }) {
  if (!clients?.length) return null;
  return (
    <section className="clients-section">
      <div className="container">
        <p className="clients-label">Нам доверяют</p>
        <div className="clients-ticker">
          <div className="clients-track">
            {[...clients, ...clients].map((c, i) => (
              <span key={i} className="clients-item">{c}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function CtaSection({ cta }) {
  const tag = cta?.tag || 'Готовы к работе';
  const title = cta?.title || 'Есть проект?\nДавайте обсудим.';
  const desc = cta?.description || 'Расскажите о задаче — ответим в течение 24 часов.';
  return (
    <section className="cta-section">
      <div className="container">
        <div className="cta-box">
          <div className="cta-box__content">
            <Tag variant="accent">{tag}</Tag>
            <h2 className="cta-box__title">
              {title.split('\n').map((line, i) => (
                <span key={i}>{line}{i < title.split('\n').length - 1 && <br />}</span>
              ))}
            </h2>
            <p className="cta-box__desc">{desc}</p>
            <Button as={Link} to="/order" size="lg">Оставить заявку</Button>
          </div>
          <div className="cta-box__decoration" aria-hidden>
            <span className="cta-deco-1">D</span>
            <span className="cta-deco-2">F</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const { site } = useSite();
  const { data: portfolio } = useApi(api.getPortfolio, []);
  const { data: services } = useApi(api.getServices, []);

  return (
    <>
      <Hero hero={site?.hero} />
      <StatsSection stats={site?.stats} />
      <WorkPreview portfolio={portfolio} />
      <ServicesPreview services={services} />
      <ClientsSection clients={site?.clients} />
      <CtaSection cta={site?.cta} />
    </>
  );
}
