import { cloneElement, forwardRef, isValidElement, useId } from 'react'
import { AlertCircle } from 'lucide-react'
import { cn } from '@/utils/format'

export const inputClasses = (invalid) => cn(
  'block w-full min-h-11 rounded-xl border bg-surface px-3.5 py-2 text-sm text-ink placeholder:text-ink-soft/70',
  'transition-colors focus:outline-none focus-visible:outline-2 focus-visible:outline-brand',
  invalid ? 'border-danger' : 'border-line-strong hover:border-ink-soft',
)

// Envuelve un control con su etiqueta, ayuda y error, y conecta los ids
// (htmlFor, aria-describedby, aria-invalid) para lectores de pantalla.
export function FormField({ label, hint, error, required, children, className, as = 'div' }) {
  const id = useId()
  const hintId = hint ? `${id}-hint` : undefined
  const errorId = error ? `${id}-error` : undefined
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined
  const control = isValidElement(children)
    ? cloneElement(children, { id, 'aria-describedby': describedBy, 'aria-invalid': error ? true : undefined, 'aria-required': required || undefined, invalid: Boolean(error) })
    : children
  const Tag = as
  return (
    <Tag className={cn('space-y-1.5', className)}>
      <label htmlFor={id} className="block text-sm font-semibold">
        {label}
        {required && <span className="text-danger" aria-hidden> *</span>}
        {required && <span className="sr-only"> (obligatorio)</span>}
      </label>
      {control}
      {hint && <p id={hintId} className="text-xs text-ink-soft">{hint}</p>}
      {error && (
        <p id={errorId} className="flex items-center gap-1 text-xs font-medium text-danger">
          <AlertCircle aria-hidden className="size-3.5" />{error}
        </p>
      )}
    </Tag>
  )
}

export const Input = forwardRef(function Input({ invalid, className, ...props }, ref) {
  return <input ref={ref} className={cn(inputClasses(invalid), className)} {...props} />
})

export const Textarea = forwardRef(function Textarea({ invalid, className, rows = 4, ...props }, ref) {
  return <textarea ref={ref} rows={rows} className={cn(inputClasses(invalid), 'min-h-24', className)} {...props} />
})

export const Select = forwardRef(function Select({ invalid, className, options = [], placeholder, ...props }, ref) {
  return (
    <select ref={ref} className={cn(inputClasses(invalid), 'pr-8', className)} {...props}>
      {placeholder != null && <option value="">{placeholder}</option>}
      {options.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
    </select>
  )
})

// Selección múltiple como casillas, para listas cortas (equipamiento, disciplinas...).
export function CheckboxGroup({ legend, options, value = [], onChange, error, required, columns = 2, hint }) {
  const id = useId()
  const toggle = (optId) => onChange(value.includes(optId) ? value.filter((v) => v !== optId) : [...value, optId])
  return (
    <fieldset aria-describedby={error ? `${id}-error` : undefined} className="space-y-2">
      <legend className="text-sm font-semibold">
        {legend}{required && <span className="text-danger" aria-hidden> *</span>}
      </legend>
      {hint && <p className="text-xs text-ink-soft">{hint}</p>}
      <div className={cn('grid gap-2', columns === 2 && 'sm:grid-cols-2', columns === 3 && 'sm:grid-cols-3')}>
        {options.map((o) => (
          <label key={o.id} className="flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border border-line bg-surface px-3 text-sm has-[:checked]:border-brand has-[:checked]:bg-brand-soft">
            <input type="checkbox" className="size-4 accent-[var(--color-brand)]" checked={value.includes(o.id)} onChange={() => toggle(o.id)} />
            {o.label}
          </label>
        ))}
      </div>
      {error && <p id={`${id}-error`} className="text-xs font-medium text-danger">{error}</p>}
    </fieldset>
  )
}

export const Checkbox = forwardRef(function Checkbox({ label, error, className, ...props }, ref) {
  const id = useId()
  return (
    <div className={className}>
      <label htmlFor={id} className="flex cursor-pointer items-start gap-2.5 text-sm">
        <input ref={ref} id={id} type="checkbox" className="mt-0.5 size-4 accent-[var(--color-brand)]"
          aria-invalid={error ? true : undefined} aria-describedby={error ? `${id}-error` : undefined} {...props} />
        <span>{label}</span>
      </label>
      {error && <p id={`${id}-error`} className="mt-1 text-xs font-medium text-danger">{error}</p>}
    </div>
  )
})
