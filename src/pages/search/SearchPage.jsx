import { Link, useSearchParams } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { PageHeader, PageContainer } from '@/components/layout/PageContainer'
import { SearchBar } from '@/components/navigation/SearchBar'
import { EmptyState, ErrorState, LoadingSkeleton } from '@/components/ui/States'
import { searchService } from '@/services'
import { useServiceQuery } from '@/hooks/useServiceQuery'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { ENTITY_ROUTES, ENTITY_LABELS, SEARCH_SCOPES } from '@/constants/navigation'

export default function SearchPage() {
  const [params] = useSearchParams()
  const q = params.get('q') ?? ''
  const scope = params.get('en') ?? 'all'
  useDocumentTitle(q ? `Resultados para "${q}"` : 'Buscar')
  const query = useServiceQuery(() => searchService.search(q, scope), [q, scope], { enabled: Boolean(q.trim()) })

  return (
    <>
      <PageHeader eyebrow="Búsqueda" title={q ? `Resultados para “${q}”` : 'Buscar en TRAMA'}
        breadcrumbs={[{ label: 'Inicio', to: '/' }, { label: 'Buscar' }]}>
        <SearchBar key={`${q}-${scope}`} initialQuery={q} initialScope={scope} size="lg" className="mt-6 max-w-3xl" />
      </PageHeader>
      <PageContainer className="py-10">
        {!q.trim() ? (
          <EmptyState title="Escribí qué estás buscando" description="Podés buscar salas, espectáculos, profesionales, convocatorias o recursos." />
        ) : query.error ? <ErrorState error={query.error} onRetry={query.reload} />
          : !query.data ? <LoadingSkeleton variant="list" count={4} />
            : query.data.length === 0 ? (
              <EmptyState title="Sin resultados" description="Probá con otras palabras o buscá en todas las categorías." />
            ) : (
              <div className="space-y-10">
                {query.data.map((group) => {
                  const catalog = SEARCH_SCOPES.find((s) => s.id === group.scope)
                  return (
                    <section key={group.scope} aria-labelledby={`g-${group.scope}`}>
                      <div className="mb-3 flex items-baseline justify-between gap-3">
                        <h2 id={`g-${group.scope}`} className="font-serif text-2xl font-semibold">{group.label} <span className="text-base font-normal text-ink-soft">({group.total})</span></h2>
                        {group.total > group.items.length && (
                          <Link to={`${catalog.to}?q=${encodeURIComponent(q)}`} className="inline-flex items-center gap-1 text-sm font-semibold text-brand hover:underline">
                            Ver los {group.total}<ArrowRight aria-hidden className="size-4" />
                          </Link>
                        )}
                      </div>
                      <ul className="divide-y divide-line rounded-[var(--radius-card)] border border-line bg-surface">
                        {group.items.map((item) => (
                          <li key={item.id}>
                            <Link to={ENTITY_ROUTES[item.type](item.slug)} className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-canvas">
                              <span className="min-w-0">
                                <span className="block font-semibold">{item.title}</span>
                                <span className="block truncate text-sm text-ink-soft">{ENTITY_LABELS[item.type]} · {item.subtitle}</span>
                              </span>
                              <ArrowRight aria-hidden className="size-4 shrink-0 text-ink-soft" />
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </section>
                  )
                })}
              </div>
            )}
      </PageContainer>
    </>
  )
}
