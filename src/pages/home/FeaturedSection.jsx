import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PageContainer } from '@/components/layout/PageContainer'
import { ErrorState, LoadingSkeleton, EmptyState } from '@/components/ui/States'
import { useServiceQuery } from '@/hooks/useServiceQuery'
import { cn } from '@/utils/format'

// Bloque de destacados de la home: título, enlace "ver todo" y grilla.
export function FeaturedSection({ id, eyebrow, title, description, to, linkLabel, fetcher, renderItem, columns = 'sm:grid-cols-2 lg:grid-cols-4', tinted = false, emptyText }) {
  const { data, error, reload } = useServiceQuery(fetcher, [])
  return (
    <section aria-labelledby={`${id}-title`} className={cn('py-14 sm:py-20', tinted && 'bg-surface border-y border-line')}>
      <PageContainer>
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl">
            {eyebrow && <p className="eyebrow mb-2 text-brand">{eyebrow}</p>}
            <h2 id={`${id}-title`} className="font-serif text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h2>
            {description && <p className="mt-2 text-ink-soft">{description}</p>}
          </div>
          <Link to={to} className="inline-flex items-center gap-1 text-sm font-semibold text-brand hover:underline">
            {linkLabel}<ArrowRight aria-hidden className="size-4" />
          </Link>
        </div>
        {error ? <ErrorState error={error} onRetry={reload} />
          : !data ? <LoadingSkeleton count={4} />
            : data.length === 0 ? <EmptyState title={emptyText ?? 'Todavía no hay publicaciones destacadas'} />
              : <ul className={cn('grid gap-5', columns)}>{data.map((item) => <li key={item.id} className="flex [&>*]:w-full">{renderItem(item)}</li>)}</ul>}
      </PageContainer>
    </section>
  )
}
