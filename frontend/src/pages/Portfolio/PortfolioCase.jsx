import { useParams, Link, Navigate } from 'react-router-dom';
import Tag from '../../components/ui/Tag';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import { useApi } from '../../hooks/useApi';
import { api } from '../../utils/api';
import './PortfolioCase.css';

export default function PortfolioCase() {
  const { id } = useParams();
  const { data: portfolio, loading } = useApi(api.getPortfolio, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '8rem 0' }}>
        <Spinner />
      </div>
    );
  }

  const project = (portfolio || []).find(p => String(p.id) === String(id));
  if (!project) return <Navigate to="/portfolio" replace />;

  const idx = portfolio.indexOf(project);
  const next = portfolio[(idx + 1) % portfolio.length];

  return (
    <div className="case-page">
      <div className="case-hero" style={{ '--case-color': project.color }}>
        <div className="container">
          <Link to="/portfolio" className="case-back">← Портфолио</Link>
          <div className="case-hero__body">
            <div className="case-hero__meta">
              {(project.tags || []).map(t => <Tag key={t}>{t}</Tag>)}
            </div>
            <h1 className="case-hero__title">{project.title}</h1>
            <p className="case-hero__desc">{project.description}</p>
            {project.stats && (
              <div className="case-hero__stats">
                {Object.entries(project.stats).map(([k, v]) => (
                  <div key={k} className="case-stat">
                    <span className="case-stat__value">{v}</span>
                    <span className="case-stat__key">
                      {{ duration: 'Длительность', deliverables: 'Материалы', result: 'Результат' }[k] || k}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="case-visual">
        <div className="container">
          <div
            className="case-mockup"
            style={{ background: `linear-gradient(135deg, ${project.color}15 0%, ${project.color}30 100%)` }}
          >
            <span className="case-mockup__letter" style={{ color: project.color }}>
              {project.title[0]}
            </span>
          </div>
        </div>
      </div>

      <div className="case-content">
        <div className="container">
          <div className="case-info-grid">
            <div className="case-info-block">
              <h3>Клиент</h3>
              <p>{project.client}</p>
            </div>
            <div className="case-info-block">
              <h3>Год</h3>
              <p>{project.year}</p>
            </div>
            <div className="case-info-block">
              <h3>Категория</h3>
              <p>{project.category}</p>
            </div>
            <div className="case-info-block">
              <h3>Теги</h3>
              <div className="case-tags">
                {(project.tags || []).map(t => <Tag key={t}>{t}</Tag>)}
              </div>
            </div>
          </div>

          <div className="case-text">
            <h2>О проекте</h2>
            <p>{project.description}</p>
            <p>
              В рамках работы над проектом команда студии провела глубокое исследование
              аудитории и конкурентной среды. На основе полученных данных была разработана
              уникальная концепция, которая нашла отражение во всех элементах дизайна.
            </p>
          </div>
        </div>
      </div>

      <div className="case-next">
        <div className="container">
          <p className="case-next__label">Следующий проект</p>
          <Link to={`/portfolio/${next.id}`} className="case-next__card">
            <h2>{next.title}</h2>
            <span>→</span>
          </Link>
        </div>
      </div>

      <div className="case-cta">
        <div className="container">
          <h2>Хотите похожий проект?</h2>
          <Button as={Link} to="/order" size="lg">Обсудить задачу</Button>
        </div>
      </div>
    </div>
  );
}
