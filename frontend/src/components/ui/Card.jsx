import './Card.css';

export default function Card({ children, className = '', hoverable = false, ...props }) {
  return (
    <div
      className={`card ${hoverable ? 'card--hoverable' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
