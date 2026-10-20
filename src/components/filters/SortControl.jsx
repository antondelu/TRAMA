import { useId } from 'react'

export function SortControl({ options, value, onChange }) {
  const id = useId()
  return (
    <div className="flex min-w-0 items-center gap-2">
      <label htmlFor={id} className="whitespace-nowrap text-sm text-ink-soft">Ordenar por</label>
      <select id={id} value={value || options[0].id} onChange={(e) => onChange(e.target.value)}
        className="min-h-10 min-w-0 max-w-full rounded-lg border border-line-strong bg-surface px-3 text-sm font-semibold">
        {options.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
      </select>
    </div>
  )
}
