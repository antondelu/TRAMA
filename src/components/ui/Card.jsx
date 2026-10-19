import { cn } from '@/utils/format'

export function Card({ as: Tag = 'div', className, children, ...props }) {
  return (
    <Tag className={cn('rounded-[var(--radius-card)] border border-line bg-surface shadow-[var(--shadow-card)]', className)} {...props}>
      {children}
    </Tag>
  )
}

// Lista de datos "etiqueta: valor" para fichas técnicas y condiciones.
// Las filas sin valor no se muestran.
export function DataList({ items, className }) {
  const rows = items.filter((row) => row && row.value != null && row.value !== '' && !(Array.isArray(row.value) && !row.value.length))
  if (!rows.length) return null
  return (
    <dl className={cn('divide-y divide-line', className)}>
      {rows.map((row) => (
        <div key={row.label} className="grid gap-1 py-2.5 sm:grid-cols-[minmax(0,12rem)_1fr] sm:gap-4">
          <dt className="text-sm text-ink-soft">{row.label}</dt>
          <dd className="text-sm">{Array.isArray(row.value) ? row.value.join(' · ') : row.value}</dd>
        </div>
      ))}
    </dl>
  )
}

export function Section({ id, title, description, children, className, actions }) {
  return (
    <section id={id} aria-labelledby={id ? `${id}-title` : undefined} className={cn('scroll-mt-24', className)}>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id={id ? `${id}-title` : undefined} className="font-serif text-2xl font-semibold">{title}</h2>
          {description && <p className="mt-1 text-sm text-ink-soft">{description}</p>}
        </div>
        {actions}
      </div>
      {children}
    </section>
  )
}
