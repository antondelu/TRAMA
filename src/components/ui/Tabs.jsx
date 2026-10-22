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
    <div role="tablist" aria-label={label} className="flex gap-4 overflow-x-auto overflow-y-hidden border-b-2 border-ink">
      {tabs.map((tab, i) => {
        const selected = tab.id === value
        return (
          <button key={tab.id} ref={(el) => { refs.current[i] = el }} type="button" role="tab"
            id={`${id}-${tab.id}`} aria-selected={selected} tabIndex={selected ? 0 : -1}
            onClick={() => onChange(tab.id)} onKeyDown={(e) => onKeyDown(e, i)}
            className={cn('flex min-h-12 items-center gap-2 whitespace-nowrap border-b-[5px] text-base font-bold transition-colors',
              selected ? 'border-brand text-brand' : 'border-transparent text-ink-soft hover:text-ink')}>
            {tab.label}
            {tab.count != null && <span className="data bg-ink/10 px-1.5 text-sm">{tab.count}</span>}
          </button>
        )
      })}
    </div>
  )
}
