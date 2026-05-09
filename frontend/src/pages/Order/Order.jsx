import { useState } from 'react';
import SectionTitle from '../../components/ui/SectionTitle';
import Button from '../../components/ui/Button';
import FormField from '../../components/ui/FormField';
import Spinner from '../../components/ui/Spinner';
import { api } from '../../utils/api';
import { useApi } from '../../hooks/useApi';
import './Order.css';

const BUDGETS = [
  'до 50 000 ₽',
  '50 000 – 150 000 ₽',
  '150 000 – 300 000 ₽',
  'от 300 000 ₽',
  'Обсудим индивидуально',
];

const STEPS = ['Услуга', 'Детали', 'Контакты'];

const INITIAL = {
  service: '',
  description: '',
  budget: '',
  name: '',
  email: '',
  phone: '',
};

function validate(step, form) {
  const errors = {};
  if (step === 0 && !form.service) errors.service = 'Выберите услугу';
  if (step === 1 && !form.description) errors.description = 'Опишите задачу';
  if (step === 2) {
    if (!form.name) errors.name = 'Введите имя';
    if (!form.email) errors.email = 'Введите email';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errors.email = 'Некорректный email';
  }
  return errors;
}

export default function Order() {
  const { data: services } = useApi(api.getServices, []);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(INITIAL);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [apiError, setApiError] = useState('');

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const next = () => {
    const errs = validate(step, form);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setStep(s => s + 1);
  };

  const back = () => { setErrors({}); setStep(s => s - 1); };

  const submit = async () => {
    const errs = validate(2, form);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    setApiError('');
    try {
      await api.createOrder(form);
      setDone(true);
    } catch (e) {
      setApiError(e.message || 'Ошибка при отправке. Попробуйте снова.');
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="order-page">
        <div className="container">
          <div className="order-success">
            <div className="order-success__icon">✓</div>
            <h2>Заявка принята!</h2>
            <p>Мы свяжемся с вами в течение 24 часов для обсуждения деталей проекта.</p>
            <Button onClick={() => { setForm(INITIAL); setStep(0); setDone(false); }}>
              Отправить ещё одну заявку
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="order-page">
      <div className="order-hero">
        <div className="container">
          <SectionTitle
            label="Заказать проект"
            title="Начнём работу"
            subtitle="Заполните форму — ответим в течение 24 часов"
          />
        </div>
      </div>

      <div className="container">
        <div className="order-layout">
          <div className="order-steps-sidebar">
            {STEPS.map((s, i) => (
              <div
                key={s}
                className={`order-step ${i === step ? 'order-step--active' : ''} ${i < step ? 'order-step--done' : ''}`}
              >
                <span className="order-step__num">
                  {i < step ? '✓' : i + 1}
                </span>
                <span className="order-step__label">{s}</span>
              </div>
            ))}
          </div>

          <div className="order-form-area">
            {step === 0 && (
              <div className="order-step-content">
                <h3>Какая услуга вам нужна?</h3>
                <div className="service-picker">
                  {(services || []).map(svc => (
                    <button
                      key={svc.id}
                      className={`service-option ${form.service === svc.title ? 'service-option--selected' : ''}`}
                      onClick={() => set('service', svc.title)}
                      type="button"
                    >
                      <span className="service-option__icon">{svc.icon}</span>
                      <span className="service-option__title">{svc.title}</span>
                      <span className="service-option__price">{svc.price}</span>
                    </button>
                  ))}
                </div>
                {errors.service && <span className="order-error">{errors.service}</span>}
                <Button onClick={next} size="lg">Далее →</Button>
              </div>
            )}

            {step === 1 && (
              <div className="order-step-content">
                <h3>Расскажите о задаче</h3>
                <FormField label="Описание проекта" required error={errors.description}>
                  <textarea
                    className="textarea"
                    style={{ minHeight: 160 }}
                    value={form.description}
                    onChange={e => set('description', e.target.value)}
                    placeholder="Опишите задачу, цели, референсы, пожелания..."
                  />
                </FormField>
                <FormField label="Бюджет">
                  <select
                    className="select"
                    value={form.budget}
                    onChange={e => set('budget', e.target.value)}
                  >
                    <option value="">Не определён</option>
                    {BUDGETS.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </FormField>
                <div className="order-nav">
                  <Button variant="ghost" onClick={back}>← Назад</Button>
                  <Button onClick={next} size="lg">Далее →</Button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="order-step-content">
                <h3>Ваши контакты</h3>
                <FormField label="Имя" required error={errors.name}>
                  <input
                    className="input"
                    value={form.name}
                    onChange={e => set('name', e.target.value)}
                    placeholder="Иван Иванов"
                  />
                </FormField>
                <FormField label="Email" required error={errors.email}>
                  <input
                    className="input"
                    type="email"
                    value={form.email}
                    onChange={e => set('email', e.target.value)}
                    placeholder="ivan@company.ru"
                  />
                </FormField>
                <FormField label="Телефон">
                  <input
                    className="input"
                    type="tel"
                    value={form.phone}
                    onChange={e => set('phone', e.target.value)}
                    placeholder="+7 (999) 000-00-00"
                  />
                </FormField>
                {apiError && <span className="order-error">{apiError}</span>}
                <div className="order-summary">
                  <p><strong>Услуга:</strong> {form.service}</p>
                  {form.budget && <p><strong>Бюджет:</strong> {form.budget}</p>}
                </div>
                <div className="order-nav">
                  <Button variant="ghost" onClick={back}>← Назад</Button>
                  <Button onClick={submit} size="lg" disabled={loading}>
                    {loading ? <Spinner size="sm" /> : 'Отправить заявку'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
