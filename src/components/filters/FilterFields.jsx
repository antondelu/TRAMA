import { useEffect, useId, useState } from 'react'
import { toList } from '@/services/query'
import { inputClasses } from '@/components/forms/FormField'

// Un filtro se define así:
//   { key, label, type: 'select' | 'multi' | 'number' | 'toggle' | 'date', options?, placeholder?, min?, unit? }

function NumberFilter({ def, value, onChange }) {
  // Se aplica al salir del campo o con Enter, no en cada tecla.
  const [draft, setDraft] = useState(value)
  useEffect(() => setDraft(value), [value])
  const id = useId()
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="text-sm font-semibold">{def.label}</label>
      <input id={id} type="number" inputMode="numeric" min={def.min ?? 0} value={draft} placeholder={def.placeholder}
        onChange={(e) => setDraft(e.target.value)} onBlur={() => draft !== value && onChange(draft)}
        onKeyDown={(e) => e.key === 'Enter' && onChange(draft)} className={inputClasses(false)} />
    </div>
  )
}

export function FilterField({ def, value, onChange }) {
  const id = useId()
  if (def.type === 'number') return <NumberFilter def={def} value={value} onChange={onChange} />

  if (def.type === 'toggle') {
    return (
      <label className="flex min-h-11 cursor-pointer items-center gap-2.5 text-sm font-semibold">
        <input type="checkbox" className="size-4 accent-[var(--color-brand)]" checked={value === '1'} onChange={(e) => onChange(e.target.checked ? '1' : '')} />
        {def.label}
      </label>
    )
  }

  if (def.type === 'multi') {
    const selected = toList(value)
    const toggle = (id2) => onChange(selected.includes(id2) ? selected.filter((v) => v !== id2) : [...selected, id2])
    return (
      <fieldset className="space-y-1.5">
        <legend className="text-sm font-semibold">{def.label}</legend>
        {def.options.map((o) => (
          <label key={o.id} className="flex min-h-9 cursor-pointer items-center gap-2.5 text-sm">
            <input type="checkbox" className="size-4 accent-[var(--color-brand)]" checked={selected.includes(o.id)} onChange={() => toggle(o.id)} />
            {o.label}
          </label>
        ))}
      </fieldset>
    )
  }

  if (def.type === 'date') {
    return (
      <div className="space-y-1">
        <label htmlFor={id} className="text-sm font-semibold">{def.label}</label>
        <input id={id} type="date" value={value} min={def.min} onChange={(e) => onChange(e.target.value)} className={inputClasses(false)} />
        {def.hint && <p className="text-xs text-ink-soft">{def.hint}</p>}
      </div>
    )
  }

  return (
    <div className="space-y-1">
      <label htmlFor={id} className="text-sm font-semibold">{def.label}</label>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className={inputClasses(false)}>
        <option value="">{def.placeholder ?? 'Todas'}</option>
        {def.options.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
      </select>
    </div>
  )
}

// Texto legible de un filtro activo, para las etiquetas.
export function describeFilter(def, value) {
  if (!value) return []
  if (def.type === 'toggle') return [{ value, text: def.label }]
  if (def.type === 'multi') return toList(value).map((v) => ({ value: v, text: def.options.find((o) => o.id === v)?.label ?? v }))
  if (def.type === 'number') return [{ value, text: `${def.chipLabel ?? def.label}: ${value}${def.unit ? ` ${def.unit}` : ''}` }]
  if (def.type === 'date') return [{ value, text: `${def.chipLabel ?? def.label}: ${value.split('-').reverse().join('/')}` }]
  return [{ value, text: def.options.find((o) => o.id === value)?.label ?? value }]
}
