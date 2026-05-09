import { NavLink } from 'react-router-dom';
import { useSite } from '../../context/SiteContext';
import './Footer.css';

export default function Footer() {
  const { site } = useSite();
  const footer = site?.footer || {};
  const social = site?.social || [];

  const tagline = footer.tagline || 'Дизайн, который работает';
  const copyright = footer.copyright || '© 2026 DFORM Studio. Все права защищены.';

  return (
    <footer className="footer">
      <div className="footer__top">
        <div className="footer__brand">
          <span className="footer__logo-mark">D</span>
          <span className="footer__logo-text">FORM</span>
          <p className="footer__tagline">{tagline}</p>
        </div>
        <nav className="footer__nav">
          <NavLink to="/portfolio">Портфолио</NavLink>
          <NavLink to="/services">Услуги</NavLink>
          <NavLink to="/about">О студии</NavLink>
          <NavLink to="/order">Заказать</NavLink>
          <NavLink to="/contacts">Контакты</NavLink>
        </nav>
        <div className="footer__social">
          {social.length > 0
            ? social.slice(0, 3).map(({ platform, url }) => (
                <a key={platform} href={url} className="footer__social-link">{platform}</a>
              ))
            : <>
                <a href="#!" className="footer__social-link">Behance</a>
                <a href="#!" className="footer__social-link">Telegram</a>
                <a href="#!" className="footer__social-link">Instagram</a>
              </>
          }
        </div>
      </div>
      <div className="footer__bottom">
        <span>{copyright}</span>
        <NavLink to="/admin" className="footer__admin-link">Вход для администратора</NavLink>
      </div>
    </footer>
  );
}
