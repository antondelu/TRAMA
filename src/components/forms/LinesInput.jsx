import { forwardRef, useState } from 'react'
import { Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { inputClasses } from './FormField'
import { cn } from '@/utils/format'

// Lista de textos cortos con "Agregar" y "Quitar". Guarda el mismo valor que
// antes guardaba el cuadro de texto (un elemento por línea, ver toLines y
// fromLines), así que los formularios no cambian su forma de guardar: solo
// desaparece la regla de "una línea por elemento", que había que recordar.
export const LinesInput = forwardRef(function LinesInput({ id, name, value = '', onChange, onBlur, invalid, addLabel = 'Agregar', placeholder, 'aria-describedby': describedBy }, ref) {
  const fromValue = (v) => {
    const items = String(v ?? '').split('\n')
    return items.length ? items : ['']
  }
  const [items, setItems] = useState(() => fromValue(value))
  // Si el formulario se reinicia (al cargar una publicación para editar), se toma el valor nuevo.
  const [seen, setSeen] = useState(value)
  if (value !== seen && value !== items.join('\n')) {
    setSeen(value)
    setItems(fromValue(value))
  }

  const update = (next) => {
    setItems(next)
    const joined = next.join('\n')
    setSeen(joined)
    onChange(joined)
  }

  return (
    <div className="space-y-2" data-field={name}>
      {items.map((item, i) => (
        <div key={i} className="flex gap-2">
          <input ref={i === 0 ? ref : undefined} id={i === 0 ? id : undefined} type="text" value={item} placeholder={placeholder}
            aria-label={i === 0 ? undefined : `Elemento ${i + 1}`} aria-describedby={describedBy} aria-invalid={invalid || undefined}
            onChange={(e) => update(items.map((x, j) => (j === i ? e.target.value : x)))} onBlur={onBlur}
            className={cn(inputClasses(invalid), 'flex-1')} />
          {items.length > 1 && (
            <button type="button" onClick={() => update(items.filter((_, j) => j !== i))} aria-label={`Quitar ${item || `elemento ${i + 1}`}`}
              className="inline-flex size-11 shrink-0 items-center justify-center rounded-lg text-ink-soft hover:bg-danger-soft hover:text-danger">
              <X aria-hidden className="size-4" />
            </button>
          )}
        </div>
      ))}
      <Button variant="secondary" size="sm" icon={Plus} onClick={() => update([...items, ''])}>{addLabel}</Button>
    </div>
  )
})
