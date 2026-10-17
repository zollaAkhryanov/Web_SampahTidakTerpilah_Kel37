// steps: ['Data diri','Data sampah','Konfirmasi'], current: 1-based
export default function Stepper({ steps, current }) {
  return (
    <ol className="stepper">
      {steps.map((s, i) => (
        <li key={s} style={{ display: 'contents' }}>
          <span className={`stepper__item${i + 1 <= current ? ' stepper__item--active' : ''}`}>
            <span className="stepper__num">{i + 1}</span>{s}
          </span>
          {i < steps.length - 1 && <span className="stepper__line" />}
        </li>
      ))}
    </ol>
  )
}
