import { useState } from 'react';
import SectionTitle from '../../components/ui/SectionTitle';
import Button from '../../components/ui/Button';
import FormField from '../../components/ui/FormField';
import { useSite } from '../../context/SiteContext';
import './Contacts.css';

export default function Contacts() {
  const { site } = useSite();
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sent, setSent] = useState(false);

  const contacts = site?.contacts || [
    { icon: '◎', label: 'Адрес', value: 'Черкесск, ул. Дизайнеров, 12, офис 304' },
    { icon: '◉', label: 'Email', value: 'hello@dform.studio' },
    { icon: '◈', label: 'Телефон', value: '+7 (495) 000-00-00' },
    { icon: '◇', label: 'Telegram', value: '@dformstudio' },
  ];

  const social = site?.social || [
    { platform: 'Behance', url: '#!' },
    { platform: 'Telegram', url: '#!' },
    { platform: 'Instagram', url: '#!' },
    { platform: 'LinkedIn', url: '#!' },
  ];

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  const handleSubmit = e => { e.preventDefault(); setSent(true); };

  return (
    <div className="contacts-page">
      <div className="contacts-hero">
        <div className="container">
          <SectionTitle
            label="Контакты"
            title="Свяжитесь с нами"
            subtitle="Готовы обсудить ваш проект или просто поздороваться"
          />
        </div>
      </div>

      <div className="container">
        <div className="contacts-grid">
          <div className="contacts-info">
            {contacts.map(({ icon, label, value }) => (
              <div key={label} className="contact-item">
                <span className="contact-item__icon">{icon}</span>
                <div>
                  <span className="contact-item__label">{label}</span>
                  <p className="contact-item__value">{value}</p>
                </div>
              </div>
            ))}

            <div className="contacts-social">
              {social.map(({ platform, url }) => (
                <a key={platform} href={url} className="social-link">{platform}</a>
              ))}
            </div>
          </div>

          <div className="contacts-form-wrap">
            {sent ? (
              <div className="contacts-success">
                <span className="contacts-success__icon">✓</span>
                <h3>Сообщение отправлено!</h3>
                <p>Ответим в течение одного рабочего дня.</p>
                <Button variant="outline" onClick={() => setSent(false)}>
                  Написать ещё
                </Button>
              </div>
            ) : (
              <form className="contacts-form" onSubmit={handleSubmit}>
                <h3>Быстрое сообщение</h3>
                <FormField label="Ваше имя" required>
                  <input
                    className="input"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Иван Иванов"
                    required
                  />
                </FormField>
                <FormField label="Email" required>
                  <input
                    className="input"
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="ivan@company.ru"
                    required
                  />
                </FormField>
                <FormField label="Сообщение" required>
                  <textarea
                    className="textarea"
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    placeholder="Расскажите о задаче..."
                    required
                  />
                </FormField>
                <Button type="submit" size="lg">Отправить</Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
