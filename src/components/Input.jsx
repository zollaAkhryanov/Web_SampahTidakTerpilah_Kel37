export default function Input({ label, error, id, ...rest }) {
  const inputId = id || `in-${label}`
  return (
    <div className={`field${error ? ' field--error' : ''}`}>
      {label && <label className="field__label" htmlFor={inputId}>{label}</label>}
      <input id={inputId} className="field__input" {...rest} />
      {error && <span className="field__error">{error}</span>}
    </div>
  )
}
