import { useMemo } from 'react'
import { PageHeader } from '@/components/layout/PageContainer'
import { CatalogView } from '@/components/filters/CatalogView'
import { OpportunityCard } from '@/components/cards/OpportunityCard'
import { Button } from '@/components/ui/Button'
import { opportunitiesService, configService } from '@/services'
import { useTaxonomies } from '@/hooks/useTaxonomies'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { todayISO } from '@/utils/dates'

const SORTS = [
  { id: 'deadline', label: 'Cierran antes' },
  { id: 'recent', label: 'Más recientes' },
  { id: 'relevance', label: 'Relevancia' },
]

export default function OpportunitiesPage() {
  useDocumentTitle('Oportunidades')
  const { tax } = useTaxonomies()
  const countries = configService.countries()

  const filterDefs = useMemo(() => [
    { key: 'type', primary: true, label: 'Tipo de oportunidad', type: 'select', placeholder: 'Todos', options: tax.opportunityTypes },
    { key: 'discipline', primary: true, label: 'Disciplina', type: 'select', options: tax.disciplines },
    { key: 'organizationType', label: 'Quién convoca', type: 'select', placeholder: 'Todos', options: tax.organizationTypes },
    { key: 'country', label: 'País', type: 'select', placeholder: 'Todos', options: countries.map((c) => ({ id: c.code, label: c.name })) },
    { key: 'city', label: 'Ciudad', type: 'select', options: countries[0].cities.map((c) => ({ id: c.name, label: c.name })) },
    { key: 'deadlineBefore', primary: true, label: 'Cierra antes del', chipLabel: 'Cierra antes del', type: 'date', min: todayISO() },
    { key: 'compensation', label: 'Condiciones económicas', type: 'select', options: tax.compensation },
  ], [tax, countries])

  return (
    <>
      <PageHeader eyebrow="Oportunidades" title="Convocatorias abiertas."
        description="Programación, festivales, residencias y más."
        breadcrumbs={[{ label: 'Inicio', to: '/' }, { label: 'Oportunidades' }]}
        actions={<Button variant="secondary" to="/publicar/convocatoria">Publicar una convocatoria</Button>} />
      <CatalogView filterDefs={filterDefs} sortOptions={SORTS} fetcher={opportunitiesService.list}
        searchPlaceholder="Buscar por título u organización" itemNoun={['convocatoria', 'convocatorias']}
        emptyTitle="No hay convocatorias abiertas con esos filtros" renderItem={(o) => <OpportunityCard opportunity={o} />} />
    </>
  )
}
