import './Tag.css';

export default function Tag({ children, variant = 'default', className = '' }) {
  return (
    <span className={`tag tag--${variant} ${className}`}>
      {children}
    </span>
  );
}
