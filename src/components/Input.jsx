export default function Input({ label, error, id, ...rest }) {
  const inputId = id || `in-${label}`
  const errorId = `${inputId}-error`
  return (
    <div className={`field${error ? ' field--error' : ''}`}>
      {label && <label className="field__label" htmlFor={inputId}>{label}</label>}
      <input
        id={inputId}
        className="field__input"
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? errorId : undefined}
        {...rest}
      />
      {error && <span id={errorId} className="field__error" role="alert">{error}</span>}
    </div>
  )
}
