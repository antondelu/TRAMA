import { useId, useRef } from 'react'
import { cn } from '@/utils/format'

// Pestañas accesibles (flechas izquierda/derecha para moverse).
export function Tabs({ tabs, value, onChange, label }) {
  const id = useId()
  const refs = useRef([])

  function onKeyDown(e, index) {
    const delta = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0
    if (!delta) return
    e.preventDefault()
    const next = (index + delta + tabs.length) % tabs.length
    onChange(tabs[next].id)
    refs.current[next]?.focus()
  }

  return (
    <div role="tablist" aria-label={label} className="flex gap-1 overflow-x-auto border-b border-line">
      {tabs.map((tab, i) => {
        const selected = tab.id === value
        return (
          <button key={tab.id} ref={(el) => { refs.current[i] = el }} type="button" role="tab"
            id={`${id}-${tab.id}`} aria-selected={selected} tabIndex={selected ? 0 : -1}
            onClick={() => onChange(tab.id)} onKeyDown={(e) => onKeyDown(e, i)}
            className={cn('-mb-px flex min-h-11 items-center gap-2 whitespace-nowrap border-b-2 px-3 text-sm font-semibold transition-colors',
              selected ? 'border-brand text-brand' : 'border-transparent text-ink-soft hover:text-ink')}>
            {tab.label}
            {tab.count != null && <span className="rounded-full bg-ink/5 px-2 text-xs">{tab.count}</span>}
          </button>
        )
      })}
    </div>
  )
}
