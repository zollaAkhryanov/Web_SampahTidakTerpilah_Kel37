// variant: 'green' (aktif) | 'yellow' (Menunggu diproses)
export default function Chip({ variant = 'green', children }) {
  return <span className={`chip chip--${variant}`}>{children}</span>
}
