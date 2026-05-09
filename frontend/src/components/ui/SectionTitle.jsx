import './SectionTitle.css';

export default function SectionTitle({ label, title, subtitle, align = 'left' }) {
  return (
    <div className={`section-title section-title--${align}`}>
      {label && <span className="section-title__label">{label}</span>}
      <h2 className="section-title__heading">{title}</h2>
      {subtitle && <p className="section-title__subtitle">{subtitle}</p>}
    </div>
  );
}
