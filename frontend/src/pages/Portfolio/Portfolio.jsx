import { useState } from 'react';
import { Link } from 'react-router-dom';
import SectionTitle from '../../components/ui/SectionTitle';
import Tag from '../../components/ui/Tag';
import Spinner from '../../components/ui/Spinner';
import { useApi } from '../../hooks/useApi';
import { api } from '../../utils/api';
import './Portfolio.css';

export default function Portfolio() {
  const { data: portfolio, loading } = useApi(api.getPortfolio, []);
  const [active, setActive] = useState('Все');

  const categories = portfolio
    ? ['Все', ...new Set(portfolio.map(p => p.category))]
    : ['Все'];

  const filtered = !portfolio ? [] : active === 'Все'
    ? portfolio
    : portfolio.filter(p => p.category === active);

  return (
    <div className="portfolio-page">
      <div className="portfolio-hero">
        <div className="container">
          <SectionTitle
            label="Наши работы"
            title="Портфолио"
            subtitle="Проекты для компаний разного масштаба — от стартапов до корпораций"
          />
        </div>
      </div>

      <div className="container">
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 0' }}>
            <Spinner />
          </div>
        ) : (
          <>
            <div className="portfolio-filters">
              {categories.map(cat => (
                <button
                  key={cat}
                  className={`filter-btn ${active === cat ? 'filter-btn--active' : ''}`}
                  onClick={() => setActive(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="portfolio-grid">
              {filtered.map((project, i) => (
                <Link
                  key={project.id}
                  to={`/portfolio/${project.id}`}
                  className={`portfolio-card ${i % 5 === 0 ? 'portfolio-card--wide' : ''}`}
                >
                  <div
                    className="portfolio-card__image"
                    style={{ background: `linear-gradient(135deg, ${project.color}18 0%, ${project.color}35 100%)` }}
                  >
                    <span className="portfolio-card__letter" style={{ color: project.color }}>
                      {project.title[0]}
                    </span>
                    <div className="portfolio-card__overlay">
                      <span>Смотреть кейс →</span>
                    </div>
                  </div>
                  <div className="portfolio-card__info">
                    <div className="portfolio-card__meta">
                      {(project.tags || []).slice(0, 2).map(t => <Tag key={t}>{t}</Tag>)}
                    </div>
                    <h3 className="portfolio-card__title">{project.title}</h3>
                    <p className="portfolio-card__client">{project.client} · {project.year}</p>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
