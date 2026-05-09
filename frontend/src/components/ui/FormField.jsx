import './FormField.css';

export default function FormField({ label, error, children, required }) {
  return (
    <div className={`form-field ${error ? 'form-field--error' : ''}`}>
      {label && (
        <label className="form-field__label">
          {label}
          {required && <span className="form-field__required">*</span>}
        </label>
      )}
      {children}
      {error && <span className="form-field__error">{error}</span>}
    </div>
  );
}
