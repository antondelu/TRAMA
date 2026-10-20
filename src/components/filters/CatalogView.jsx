import { useEffect, useState } from 'react'
import { SlidersHorizontal, Search, X } from 'lucide-react'
import { FilterSidebar } from './FilterSidebar'
import { FilterChips } from './FilterChips'
import { SortControl } from './SortControl'
import { Pagination } from '@/components/ui/Pagination'
import { EmptyState, ErrorState, LoadingSkeleton } from '@/components/ui/States'
import { Button } from '@/components/ui/Button'
import { PageContainer } from '@/components/layout/PageContainer'
import { useUrlFilters } from '@/hooks/useUrlFilters'
import { useServiceQuery } from '@/hooks/useServiceQuery'
import { inputClasses } from '@/components/forms/FormField'
import { Reveal } from '@/components/ui/Reveal'
import { cn } from '@/utils/format'

// Buscador interno del catálogo: se aplica al enviar, no en cada tecla.
function CatalogSearch({ value, onSubmit, placeholder }) {
  const [draft, setDraft] = useState(value)
  useEffect(() => setDraft(value), [value])
  return (
    <form role="search" className="relative flex-1" onSubmit={(e) => { e.preventDefault(); onSubmit(draft.trim()) }}>
      <label htmlFor="catalog-q" className="sr-only">Buscar en este catálogo</label>
      <Search aria-hidden className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-soft" />
      <input id="catalog-q" type="search" value={draft} onChange={(e) => setDraft(e.target.value)} placeholder={placeholder}
        className={cn(inputClasses(false), 'pl-9 pr-9')} />
      {draft && (
        <button type="button" onClick={() => { setDraft(''); onSubmit('') }} aria-label="Limpiar búsqueda"
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-ink-soft hover:text-ink"><X aria-hidden className="size-4" /></button>
      )}
    </form>
  )
}

// Catálogo completo: buscador, filtros en la URL, orden, contador,
// grilla, paginación y todos los estados (carga, error, vacío).
export function CatalogView({ filterDefs, sortOptions, fetcher, renderItem, searchPlaceholder, emptyTitle = 'No hay resultados con esos filtros', gridClass = 'sm:grid-cols-2 xl:grid-cols-3', itemNoun = ['resultado', 'resultados'] }) {
  const keys = ['q', 'sort', ...filterDefs.map((d) => d.key)]
  const { filters, update, clear, activeCount } = useUrlFilters(keys)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const query = useServiceQuery(() => fetcher(filters), [JSON.stringify(filters)])
  const data = query.data

  const changePage = (page) => {
    update({ page }, { resetPage: false })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <PageContainer className="py-8">
      <div className="grid gap-8 lg:grid-cols-[17rem_1fr]">
        <FilterSidebar defs={filterDefs} values={filters} onChange={update} onClear={() => clear()} activeCount={activeCount}
          mobileOpen={drawerOpen} onMobileClose={() => setDrawerOpen(false)} resultCount={data?.total} />
        <div className="min-w-0 space-y-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <CatalogSearch value={filters.q} onSubmit={(q) => update({ q })} placeholder={searchPlaceholder} />
            <div className="flex min-w-0 items-center justify-between gap-3">
              <Button variant="secondary" className="shrink-0 lg:hidden" icon={SlidersHorizontal} onClick={() => setDrawerOpen(true)}>
                Filtros{activeCount ? ` (${activeCount})` : ''}
              </Button>
              <SortControl options={sortOptions} value={filters.sort} onChange={(sort) => update({ sort })} />
            </div>
          </div>
          <FilterChips defs={filterDefs} values={filters} onChange={update} onClear={() => clear()} />
          <p className="text-sm text-ink-soft" aria-live="polite">
            {data && `${data.total} ${data.total === 1 ? itemNoun[0] : itemNoun[1]}${filters.q ? ` para "${filters.q}"` : ''}`}
          </p>

          {query.error ? <ErrorState error={query.error} onRetry={query.reload} />
            : !data ? <LoadingSkeleton />
              : data.items.length === 0 ? (
                <EmptyState title={emptyTitle} description="Probá quitando algún filtro o buscando con otras palabras."
                  action={(activeCount > 0 || filters.q) && <Button variant="secondary" onClick={() => clear({ keepQuery: false })}>Quitar filtros y búsqueda</Button>} />
              ) : (
                <>
                  <ul className={cn('grid gap-5', gridClass, query.loading && 'opacity-60 transition-opacity')}>
                    {data.items.map((item, i) => <Reveal as="li" key={item.id} delay={(i % 3) * 80} className="flex [&>*]:w-full">{renderItem(item)}</Reveal>)}
                  </ul>
                  <Pagination page={data.page} pageCount={data.pageCount} onChange={changePage} />
                </>
              )}
        </div>
      </div>
    </PageContainer>
  )
}
