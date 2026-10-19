import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { PageContainer } from '@/components/layout/PageContainer'
import { ErrorState, LoadingSkeleton, EmptyState } from '@/components/ui/States'
import { useServiceQuery } from '@/hooks/useServiceQuery'
import { Reveal } from '@/components/ui/Reveal'
import { cn } from '@/utils/format'

// Bloque de destacados de la home: título, enlace "ver todo" y grilla.
export function FeaturedSection({ id, eyebrow, title, description, to, linkLabel, fetcher, renderItem, columns = 'sm:grid-cols-2 lg:grid-cols-4', emptyText }) {
  const { data, error, reload } = useServiceQuery(fetcher, [])
  return (
    <section aria-labelledby={`${id}-title`} className="py-12 sm:py-16">
      <PageContainer>
        <Reveal className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl">
            {eyebrow && <p className="tag mb-3">{eyebrow}</p>}
            <h2 id={`${id}-title`} className="font-display text-3xl font-bold tracking-tight sm:text-4xl">{title}</h2>
            {description && <p className="mt-2 text-ink-soft">{description}</p>}
          </div>
          <Button variant="secondary" size="sm" to={to} iconRight={ArrowRight}>{linkLabel}</Button>
        </Reveal>
        {error ? <ErrorState error={error} onRetry={reload} />
          : !data ? <LoadingSkeleton count={4} />
            : data.length === 0 ? <EmptyState title={emptyText ?? 'Todavía no hay publicaciones destacadas'} />
              : <ul className={cn('grid gap-5', columns)}>{data.map((item, i) => <Reveal as="li" key={item.id} delay={i * 90} className="flex [&>*]:w-full">{renderItem(item)}</Reveal>)}</ul>}
      </PageContainer>
    </section>
  )
}
