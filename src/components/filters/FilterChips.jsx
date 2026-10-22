import { X } from 'lucide-react'
import { describeFilter } from './FilterFields'
import { toList } from '@/services/query'

// Filtros activos como etiquetas que se pueden quitar de a una.
export function FilterChips({ defs, values, onChange, onClear }) {
  const chips = defs.flatMap((def) => describeFilter(def, values[def.key]).map((c) => ({ ...c, def })))
  if (!chips.length) return null

  function remove({ def, value }) {
    if (def.type === 'multi') onChange({ [def.key]: toList(values[def.key]).filter((v) => v !== value) })
    else onChange({ [def.key]: '' })
  }

  return (
    <div className="flex flex-wrap items-center gap-2" aria-label="Filtros activos">
      {chips.map((chip) => (
        <button key={`${chip.def.key}-${chip.value}`} type="button" onClick={() => remove(chip)}
          className="inline-flex min-h-10 items-center gap-1.5 bg-ink px-3 text-sm font-bold text-white hover:bg-danger">
          {chip.text}
          <X aria-hidden className="size-3.5" />
          <span className="sr-only">(quitar filtro)</span>
        </button>
      ))}
      <button type="button" onClick={onClear} className="min-h-10 text-sm font-bold text-ink underline underline-offset-4 hover:decoration-2">Limpiar todo</button>
    </div>
  )
}
