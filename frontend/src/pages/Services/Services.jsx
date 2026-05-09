import { Link } from 'react-router-dom';
import SectionTitle from '../../components/ui/SectionTitle';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import { useApi } from '../../hooks/useApi';
import { api } from '../../utils/api';
import './Services.css';

export default function Services() {
  const { data: services, loading } = useApi(api.getServices, []);

  return (
    <div className="services-page">
      <div className="services-hero">
        <div className="container">
          <SectionTitle
            label="Услуги"
            title="Что мы делаем"
            subtitle="Полный цикл дизайна: от стратегии до финального продукта"
          />
        </div>
      </div>

      <div className="container">
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 0' }}>
            <Spinner />
          </div>
        ) : (
          <div className="services-grid">
            {(services || []).map((service, i) => (
              <div key={service.id} className="service-card">
                <div className="service-card__top">
                  <span className="service-card__icon">{service.icon}</span>
                  <span className="service-card__num">0{i + 1}</span>
                </div>
                <h2 className="service-card__title">{service.title}</h2>
                <p className="service-card__desc">{service.description}</p>
                <ul className="service-card__features">
                  {(service.features || []).map(f => (
                    <li key={f}>
                      <span className="service-card__check">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <div className="service-card__footer">
                  <div className="service-card__pricing">
                    <span className="service-card__price">{service.price}</span>
                    <span className="service-card__duration">{service.duration}</span>
                  </div>
                  <Button as={Link} to="/order" variant="outline" size="sm">
                    Заказать
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="services-cta">
          <h2>Не нашли нужное?</h2>
          <p>Обсудим вашу задачу индивидуально — у нас нет стандартных решений.</p>
          <Button as={Link} to="/contacts" size="lg">Написать нам</Button>
        </div>
      </div>
    </div>
  );
}
