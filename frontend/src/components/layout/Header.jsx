import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import './Header.css';

const NAV = [
  { to: '/', label: 'Главная' },
  { to: '/portfolio', label: 'Портфолио' },
  { to: '/services', label: 'Услуги' },
  { to: '/about', label: 'О студии' },
  { to: '/contacts', label: 'Контакты' },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleOrderClick = () => {
    setOpen(false);
    navigate('/order');
  };

  return (
    <>
      <header className="header">
        <NavLink to="/" className="header__logo">
          <span className="header__logo-mark">D</span>
          <span className="header__logo-text">FORM</span>
        </NavLink>
        <nav className="header__nav">
          {NAV.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                'header__link' + (isActive ? ' header__link--active' : '')
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
        <NavLink to="/order" className="header__cta header__cta--desktop">
          Заказать проект
        </NavLink>
        <button
          className={`header__burger ${open ? 'header__burger--open' : ''}`}
          onClick={() => setOpen(o => !o)}
          aria-label="Меню"
        >
          <span /><span /><span />
        </button>
      </header>

      {open && (
        <div className="mobile-menu">
          <nav className="mobile-menu__nav">
            {NAV.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className="mobile-menu__link"
                onClick={() => setOpen(false)}
              >
                {label}
              </NavLink>
            ))}
          </nav>
          <button className="mobile-menu__cta" onClick={handleOrderClick}>
            Заказать проект
          </button>
        </div>
      )}
    </>
  );
}
