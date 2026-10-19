import { HeroSection } from './HeroSection'
import { CategoryCards } from './CategoryCards'
import { FeaturedSection } from './FeaturedSection'
import { JoinSection } from './JoinSection'
import { PageContainer } from '@/components/layout/PageContainer'
import { VenueCard } from '@/components/cards/VenueCard'
import { ShowCard } from '@/components/cards/ShowCard'
import { ProfessionalCard } from '@/components/cards/ProfessionalCard'
import { OpportunityCard } from '@/components/cards/OpportunityCard'
import { ResourceCard } from '@/components/cards/ResourceCard'
import { venuesService, showsService, servicesService, opportunitiesService, resourcesService } from '@/services'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

export default function HomePage() {
  useDocumentTitle(null)
  return (
    <>
      <HeroSection />
      <section aria-labelledby="categories-title" className="py-14 sm:py-20">
        <PageContainer>
          <h2 id="categories-title" className="mb-8 font-serif text-3xl font-semibold tracking-tight sm:text-4xl">Cuatro áreas, un mismo sector</h2>
          <CategoryCards />
        </PageContainer>
      </section>
      <FeaturedSection id="venues" tinted eyebrow="Salas" title="Salas destacadas" description="Espacios con ficha técnica completa y calendario actualizado."
        to="/salas" linkLabel="Ver todas las salas" fetcher={() => venuesService.featured(4)} renderItem={(v) => <VenueCard venue={v} />} />
      <FeaturedSection id="shows" eyebrow="Espectáculos" title="Obras para programar" description="Propuestas disponibles para salas, festivales y giras."
        to="/espectaculos" linkLabel="Ver catálogo" fetcher={() => showsService.featured(4)} renderItem={(s) => <ShowCard show={s} />} />
      <FeaturedSection id="opportunities" tinted eyebrow="Oportunidades" title="Convocatorias abiertas" description="Solo se muestran las que siguen recibiendo postulaciones."
        to="/oportunidades" linkLabel="Ver todas" columns="sm:grid-cols-2 lg:grid-cols-3" emptyText="No hay convocatorias abiertas en este momento"
        fetcher={() => opportunitiesService.featured(3)} renderItem={(o) => <OpportunityCard opportunity={o} />} />
      <FeaturedSection id="pros" eyebrow="Servicios" title="Profesionales del sector" description="Técnica, diseño, producción y comunicación."
        to="/servicios" linkLabel="Ver directorio" fetcher={() => servicesService.featured(4)} renderItem={(p) => <ProfessionalCard pro={p} />} />
      <FeaturedSection id="resources" eyebrow="Recursos" title="Para seguir aprendiendo" description="Guías, entrevistas, podcasts y plantillas. Algunos son exclusivos para miembros."
        to="/recursos" linkLabel="Ir a la biblioteca" fetcher={() => resourcesService.featured(4)} renderItem={(r) => <ResourceCard resource={r} />} />
      <JoinSection />
    </>
  )
}
