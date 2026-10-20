import { useEffect, useId } from 'react'
import { Newspaper } from 'lucide-react'
import { inputClasses } from '@/components/forms/FormField'
import { Button } from '@/components/ui/Button'
import { EmptyState, ErrorState, LoadingSkeleton } from '@/components/ui/States'
import { cn, plural } from '@/utils/format'
import { NewsCard } from './NewsCard'
import { useNewsFeed } from './useNewsFeed'

const GROUP_LABELS = { area: 'Región', department: 'Departamento', country: 'País' }

function FilterSelect({ label, value, onChange, options, placeholder }) {
  const id = useId()
  return (
    <div className="min-w-44 flex-1 space-y-1 sm:flex-none">
      <label htmlFor={id} className="text-sm font-semibold">{label}</label>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className={inputClasses(false)}>
        <option value="">{placeholder}</option>
        {options}
      </select>
    </div>
  )
}

// Opciones de ubicación agrupadas (Montevideo/Interior y departamentos, o
// región y países), con la cantidad de noticias de cada una.
function locationOptions(locations = []) {
  const groups = locations.reduce((acc, l) => ({ ...acc, [l.group]: [...(acc[l.group] ?? []), l] }), {})
  return Object.entries(groups).map(([group, list]) => (
    <optgroup key={group} label={GROUP_LABELS[group] ?? group}>
      {list.map((l) => <option key={l.id} value={l.id}>{l.label} ({l.count})</option>)}
    </optgroup>
  ))
}

// Un bloque de noticias (Uruguay o Internacional) con sus propios filtros,
// estados de carga, vacío y error, y "Cargar más".
export function NewsSection({ section, title, description, filters, onFiltersChange, onNextRunAt, featured = false, className }) {
  const feed = useNewsFeed(section, filters)
  useEffect(() => { if (feed.nextRunAt) onNextRunAt?.(feed.nextRunAt) }, [feed.nextRunAt, onNextRunAt])
  const headingId = useId()
  const filtered = Boolean(filters.discipline || filters.location)
  const set = (key) => (value) => onFiltersChange({ ...filters, [key]: value })

  return (
    <section aria-labelledby={headingId} className={className}>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-2xl">
          <h2 id={headingId} className={cn('font-display font-semibold', featured ? 'text-3xl md:text-4xl' : 'text-2xl md:text-3xl')}>{title}</h2>
          {description && <p className="mt-1 text-ink-soft">{description}</p>}
        </div>
        {(feed.facets || filtered) && (
          <div className="flex w-full flex-wrap gap-3 sm:w-auto">
            <FilterSelect label="Disciplina" value={filters.discipline ?? ''} onChange={set('discipline')} placeholder="Todas"
              options={(feed.facets?.disciplines ?? []).map((d) => <option key={d.id} value={d.id}>{d.label} ({d.count})</option>)} />
            <FilterSelect label="Ubicación" value={filters.location ?? ''} onChange={set('location')} placeholder="Todas"
              options={locationOptions(feed.facets?.locations)} />
          </div>
        )}
      </div>

      <div className="mt-6">
        {feed.loading && <LoadingSkeleton count={featured ? 6 : 3} label={`Cargando noticias de ${title}…`} />}
        {!feed.loading && feed.error && !feed.items.length && <ErrorState error={feed.error} onRetry={feed.retry} />}
        {!feed.loading && !feed.error && !feed.items.length && (
          <EmptyState icon={Newspaper}
            title={filtered ? 'No hay noticias con esos filtros' : 'Todavía no hay noticias en esta sección'}
            description={filtered ? 'Probá con otra disciplina o ubicación.' : 'Se actualiza automáticamente cada hora.'}
            action={filtered && <Button variant="secondary" onClick={() => onFiltersChange({})}>Quitar filtros</Button>} />
        )}
        {!feed.loading && feed.items.length > 0 && (
          <>
            <p className="sr-only" aria-live="polite">{feed.total} {plural(feed.total, 'noticia', 'noticias')}</p>
            <div className={cn('grid gap-5 sm:grid-cols-2', featured ? 'xl:grid-cols-3' : 'lg:grid-cols-3')}>
              {feed.items.map((item, i) => <NewsCard key={item.id} item={item} featured={featured && i === 0} />)}
            </div>
            {feed.error && <p role="alert" className="mt-4 text-sm text-danger">{feed.error.message}</p>}
            {feed.hasMore && (
              <div className="mt-8 flex justify-center">
                <Button variant="secondary" loading={feed.loadingMore} onClick={feed.error ? feed.retry : feed.loadMore}>
                  {feed.error ? 'Reintentar' : 'Cargar más'}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  )
}
