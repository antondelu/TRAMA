import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { FilterField } from './FilterFields'
import { Drawer } from '@/components/ui/Drawer'
import { Button } from '@/components/ui/Button'
import { toList } from '@/services/query'
import { cn } from '@/utils/format'

// Muestra los filtros marcados como `primary`; el resto queda en "Más filtros"
// (abierto si alguno de ellos está activo). Sin marcas, se ven todos.
function FilterList({ defs, values, onChange }) {
  const hasPrimary = defs.some((d) => d.primary)
  const main = hasPrimary ? defs.filter((d) => d.primary) : defs
  const more = hasPrimary ? defs.filter((d) => !d.primary) : []
  const activeMore = more.filter((d) => toList(values[d.key]).length > 0).length
  const [open, setOpen] = useState(activeMore > 0)
  const field = (def) => <FilterField key={def.key} def={def} value={values[def.key] ?? ''} onChange={(v) => onChange({ [def.key]: v })} />

  return (
    <div className="space-y-5">
      {main.map(field)}
      {more.length > 0 && (
        <div className="border-t border-line pt-4">
          <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open}
            className="flex min-h-11 w-full items-center justify-between text-base font-bold text-ink underline decoration-2 underline-offset-4">
            {open ? 'Menos filtros' : `Más filtros${activeMore ? ` (${activeMore} activo${activeMore > 1 ? 's' : ''})` : ''}`}
            <ChevronDown aria-hidden className={cn('size-4 transition-transform duration-300', open && 'rotate-180')} />
          </button>
          {open && <div className="enter mt-5 space-y-5">{more.map(field)}</div>}
        </div>
      )}
    </div>
  )
}

// Filtros en panel lateral (escritorio) o en drawer (móvil).
export function FilterSidebar({ defs, values, onChange, onClear, activeCount, mobileOpen, onMobileClose, resultCount }) {
  return (
    <>
      <aside aria-label="Filtros" className="hidden lg:block">
        <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto border-t-4 border-ink bg-surface p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-2xl font-extrabold">Filtros</h2>
            {activeCount > 0 && <Button variant="link" size="sm" onClick={onClear}>Limpiar</Button>}
          </div>
          <FilterList defs={defs} values={values} onChange={onChange} />
        </div>
      </aside>
      <Drawer open={mobileOpen} onClose={onMobileClose} title="Filtros"
        footer={(
          <div className="grid grid-cols-2 gap-2">
            <Button variant="secondary" onClick={onClear} disabled={!activeCount}>Limpiar</Button>
            <Button onClick={onMobileClose}>Ver {resultCount ?? ''} resultados</Button>
          </div>
        )}>
        <FilterList defs={defs} values={values} onChange={onChange} />
      </Drawer>
    </>
  )
}
