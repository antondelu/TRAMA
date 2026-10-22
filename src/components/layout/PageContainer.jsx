import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/utils/format'

export function PageContainer({ children, className, narrow = false }) {
  return <div className={cn('mx-auto w-full px-4 sm:px-6 lg:px-8', narrow ? 'max-w-3xl' : 'max-w-7xl', className)}>{children}</div>
}

export function Breadcrumbs({ items }) {
  return (
    <nav aria-label="Ruta de navegación" className="mb-4">
      <ol className="flex flex-wrap items-center gap-1 text-sm text-ink-soft">
        {items.map((item, i) => {
          const last = i === items.length - 1
          return (
            <li key={item.label} className="flex items-center gap-1">
              {item.to && !last ? <Link to={item.to} className="underline decoration-1 underline-offset-2 hover:text-ink hover:decoration-2">{item.label}</Link>
                : <span aria-current={last ? 'page' : undefined} className={last ? 'text-ink' : ''}>{item.label}</span>}
              {!last && <ChevronRight aria-hidden className="size-3.5" />}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

// Encabezado de página. Con `area` (ej. 'area-salas') lleva una franja y la
// etiqueta del color de esa área, así el catálogo se reconoce de un vistazo.
export function PageHeader({ eyebrow, title, description, breadcrumbs, actions, area, children, className }) {
  return (
    <header className={cn('relative border-b-2 border-ink', area, className)}>
      {area && <div aria-hidden className="h-2 bg-[var(--area)]" />}
      <PageContainer className="relative pb-7 pt-7 sm:pb-10 sm:pt-10">
        {breadcrumbs && <Breadcrumbs items={breadcrumbs} />}
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-3xl">
            {eyebrow && <p className="tag mb-4">{eyebrow}</p>}
            <h1 className="font-display text-[2rem] font-extrabold leading-[0.95] sm:text-6xl">{title}</h1>
            {description && <p className="mt-4 text-lg text-ink-soft">{description}</p>}
          </div>
          {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
        </div>
        {children}
      </PageContainer>
    </header>
  )
}
