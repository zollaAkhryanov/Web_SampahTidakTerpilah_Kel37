import { Link } from 'react-router-dom'

// variant: 'primary' (solid hijau) | 'outline' (outline hijau). Jika ada `to`, tampil sebagai link.
export default function Button({ variant = 'primary', to, block, className = '', children, ...rest }) {
  const cls = `btn btn--${variant}${block ? ' btn--block' : ''} ${className}`.trim()
  if (to) return <Link to={to} className={cls} {...rest}>{children}</Link>
  return <button type="button" className={cls} {...rest}>{children}</button>
}
