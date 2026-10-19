import { FilterField } from './FilterFields'
import { Drawer } from '@/components/ui/Drawer'
import { Button } from '@/components/ui/Button'

function FilterList({ defs, values, onChange }) {
  return (
    <div className="space-y-5">
      {defs.map((def) => (
        <FilterField key={def.key} def={def} value={values[def.key] ?? ''} onChange={(v) => onChange({ [def.key]: v })} />
      ))}
    </div>
  )
}

// Filtros en panel lateral (escritorio) o en drawer (móvil).
export function FilterSidebar({ defs, values, onChange, onClear, activeCount, mobileOpen, onMobileClose, resultCount }) {
  return (
    <>
      <aside aria-label="Filtros" className="hidden lg:block">
        <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto rounded-[var(--radius-card)] border border-line bg-surface p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">Filtros</h2>
            {activeCount > 0 && <Button variant="link" size="sm" onClick={onClear}>Limpiar filtros</Button>}
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
