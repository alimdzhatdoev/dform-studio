import { Link } from 'react-router-dom';
import SectionTitle from '../../components/ui/SectionTitle';
import Button from '../../components/ui/Button';
import { useApi } from '../../hooks/useApi';
import { useSite } from '../../context/SiteContext';
import { api } from '../../utils/api';
import './About.css';

export default function About() {
  const { site } = useSite();
  const { data: team } = useApi(api.getTeam, []);

  const stats = site?.stats || [];
  const clients = site?.clients || [];
  const values = site?.values || [];
  const aboutStory = site?.about_story || {};

  return (
    <div className="about-page">
      <div className="about-hero">
        <div className="container">
          <div className="about-hero__content">
            <SectionTitle
              label="О студии"
              title="Мы — DFORM"
              subtitle="Дизайн-студия с характером. Работаем с брендами, которые хотят быть заметными."
            />
            {stats.length > 0 && (
              <div className="about-hero__stats">
                {stats.map(({ value, label }) => (
                  <div key={label} className="about-stat">
                    <span className="about-stat__value">{value}</span>
                    <span className="about-stat__label">{label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <section className="about-story">
        <div className="container">
          <div className="about-story__grid">
            <div className="about-story__text">
              <h2>{aboutStory.title || 'Как всё началось'}</h2>
              {(aboutStory.paragraphs || [
                'Студия основана в 2017 году группой дизайнеров, уставших от корпоративной скуки. Мы хотели создавать работы, которые нас самих вдохновляют, — и нашли клиентов, которым нужно именно это.',
                'За восемь лет мы выросли из двухчеловеческой мастерской в команду из 14 специалистов. Работаем с компаниями из России, Европы и Средней Азии — от стартапов Series A до компаний из рейтинга Forbes 500.',
                'Наш принцип: дизайн должен решать задачи бизнеса, а не просто хорошо выглядеть. Поэтому мы начинаем каждый проект с вопроса «Зачем?» — и не останавливаемся, пока не найдём ответ.',
              ]).map((p, i) => <p key={i}>{p}</p>)}
            </div>
            <div className="about-story__visual" aria-hidden>
              <div className="about-story__shape">
                <span>2017</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {values.length > 0 && (
        <section className="about-values">
          <div className="container">
            <SectionTitle label="Принципы" title="Наши ценности" />
            <div className="values-grid">
              {values.map(({ icon, title, desc }) => (
                <div key={title} className="value-card">
                  <span className="value-card__icon">{icon}</span>
                  <h3 className="value-card__title">{title}</h3>
                  <p className="value-card__desc">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {team && team.length > 0 && (
        <section className="about-team">
          <div className="container">
            <SectionTitle
              label="Команда"
              title="Люди, которые делают проекты"
            />
            <div className="team-grid">
              {team.map(person => (
                <div key={person.id} className="team-card">
                  <div
                    className="team-card__avatar"
                    style={{ background: `${person.color}22`, color: person.color }}
                  >
                    {person.initials}
                  </div>
                  <div className="team-card__info">
                    <h3 className="team-card__name">{person.name}</h3>
                    <span className="team-card__role">{person.role}</span>
                    <p className="team-card__bio">{person.bio}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {clients.length > 0 && (
        <section className="about-clients">
          <div className="container">
            <SectionTitle label="Клиенты" title="Кому мы доверяем свою экспертизу" />
            <div className="clients-mosaic">
              {clients.map((c, i) => (
                <div key={i} className="client-chip">{c}</div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="about-cta">
        <div className="container">
          <h2>Хотите работать с нами?</h2>
          <p>Оставьте заявку — ответим в течение одного рабочего дня.</p>
          <div className="about-cta__btns">
            <Button as={Link} to="/order" size="lg">Оставить заявку</Button>
            <Button as={Link} to="/contacts" variant="outline" size="lg">Контакты</Button>
          </div>
        </div>
      </section>
    </div>
  );
}
