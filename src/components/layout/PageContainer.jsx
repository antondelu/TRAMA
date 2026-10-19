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
              {item.to && !last ? <Link to={item.to} className="hover:text-ink hover:underline">{item.label}</Link>
                : <span aria-current={last ? 'page' : undefined} className={last ? 'text-ink' : ''}>{item.label}</span>}
              {!last && <ChevronRight aria-hidden className="size-3.5" />}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

export function PageHeader({ eyebrow, title, description, breadcrumbs, actions, children, className }) {
  return (
    <header className={cn('border-b border-line bg-surface', className)}>
      <PageContainer className="py-8 sm:py-12">
        {breadcrumbs && <Breadcrumbs items={breadcrumbs} />}
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-3xl">
            {eyebrow && <p className="eyebrow mb-2 text-brand">{eyebrow}</p>}
            <h1 className="font-serif text-3xl font-semibold tracking-tight sm:text-5xl">{title}</h1>
            {description && <p className="mt-3 text-base text-ink-soft sm:text-lg">{description}</p>}
          </div>
          {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
        </div>
        {children}
      </PageContainer>
    </header>
  )
}
