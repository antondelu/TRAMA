import { useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Reveal } from '@/components/ui/Reveal'
import { PageContainer } from '@/components/layout/PageContainer'
import { ErrorState, LoadingSkeleton, EmptyState } from '@/components/ui/States'
import { VenueCard } from '@/components/cards/VenueCard'
import { ShowCard } from '@/components/cards/ShowCard'
import { ProfessionalCard } from '@/components/cards/ProfessionalCard'
import { ResourceCard } from '@/components/cards/ResourceCard'
import { OpportunityCard } from '@/components/cards/OpportunityCard'
import { venuesService, showsService, servicesService, resourcesService, opportunitiesService } from '@/services'
import { useServiceQuery } from '@/hooks/useServiceQuery'
import { cn } from '@/utils/format'

// Un solo bloque de destacados con pestañas, en lugar de una sección por
// categoría: menos información de golpe en la home.
const TABS = [
  { id: 'salas', area: 'area-salas', label: 'Salas', to: '/salas', fetch: () => venuesService.featured(3), render: (x) => <VenueCard venue={x} /> },
  { id: 'espectaculos', area: 'area-shows', label: 'Espectáculos', to: '/espectaculos', fetch: () => showsService.featured(3), render: (x) => <ShowCard show={x} /> },
  { id: 'servicios', area: 'area-servicios', label: 'Servicios', to: '/servicios', fetch: () => servicesService.featured(3), render: (x) => <ProfessionalCard pro={x} /> },
  { id: 'oportunidades', area: 'area-convocatorias', label: 'Convocatorias', to: '/oportunidades', fetch: () => opportunitiesService.featured(3), render: (x) => <OpportunityCard opportunity={x} /> },
  { id: 'recursos', area: 'area-recursos', label: 'Recursos', to: '/recursos', fetch: () => resourcesService.featured(3), render: (x) => <ResourceCard resource={x} /> },
]

// Contenido de una pestaña. Se monta de nuevo al cambiar de pestaña (key),
// así nunca se muestran datos de una categoría con la tarjeta de otra.
function TabContent({ tab }) {
  const { data, error, reload } = useServiceQuery(tab.fetch, [])
  if (error) return <ErrorState error={error} onRetry={reload} />
  if (!data) return <LoadingSkeleton count={3} />
  if (data.length === 0) return <EmptyState title="Todavía no hay destacados acá" />
  return (
    <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {data.map((item, i) => <li key={item.id} className="enter flex [&>*]:w-full" style={{ '--d': `${i * 80}ms` }}>{tab.render(item)}</li>)}
    </ul>
  )
}

export function FeaturedTabs() {
  const [active, setActive] = useState(TABS[0].id)
  const tab = TABS.find((t) => t.id === active)

  return (
    <section aria-labelledby="featured-title" className="py-14 sm:py-20">
      <PageContainer>
        <Reveal className="mb-8 flex flex-wrap items-end justify-between gap-x-8 gap-y-4 border-b-2 border-ink">
          <h2 id="featured-title" className="pb-3 font-display text-4xl font-extrabold leading-none sm:text-6xl">Destacados</h2>
          {/* Pestañas subrayadas con el color de cada área, como el menú principal. */}
          <div role="tablist" aria-label="Categoría de destacados" className="-mb-0.5 flex max-w-full gap-5 overflow-x-auto">
            {TABS.map((t) => (
              <button key={t.id} type="button" role="tab" aria-selected={t.id === active} onClick={() => setActive(t.id)}
                className={cn('min-h-12 shrink-0 border-b-[6px] text-base font-bold transition-colors', t.area,
                  t.id === active ? 'border-[var(--area)] text-ink' : 'border-transparent text-ink-soft hover:text-ink')}>
                {t.label}
              </button>
            ))}
          </div>
        </Reveal>
        <div role="tabpanel" aria-label={tab.label}>
          <TabContent key={active} tab={tab} />
          <div className="mt-8 flex justify-center">
            <Button variant="secondary" to={tab.to} iconRight={ArrowRight}>Ver todo en {tab.label}</Button>
          </div>
        </div>
      </PageContainer>
    </section>
  )
}
