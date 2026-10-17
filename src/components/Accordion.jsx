import { useState } from 'react'

export default function Accordion({ title, children }) {
  const [open, setOpen] = useState(false)
  return (
    <div className={`accordion${open ? ' accordion--open' : ''}`}>
      <button className="accordion__head" aria-expanded={open} onClick={() => setOpen(!open)}>
        {title}<span className="accordion__arrow">▼</span>
      </button>
      {open && <div className="accordion__body">{children}</div>}
    </div>
  )
}
