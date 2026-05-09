import './Button.css';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  as: Tag = 'button',
  className = '',
  ...props
}) {
  return (
    <Tag
      className={`btn btn--${variant} btn--${size} ${className}`}
      {...props}
    >
      {children}
    </Tag>
  );
}
