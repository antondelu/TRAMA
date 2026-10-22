import { useMemo } from 'react'
import { PageHeader } from '@/components/layout/PageContainer'
import { CatalogView } from '@/components/filters/CatalogView'
import { ShowCard, SHOW_AVAILABILITY } from '@/components/cards/ShowCard'
import { Button } from '@/components/ui/Button'
import { showsService, configService } from '@/services'
import { useTaxonomies } from '@/hooks/useTaxonomies'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

const SORTS = [
  { id: 'relevance', label: 'Relevancia' },
  { id: 'title', label: 'Título (A-Z)' },
  { id: 'recent', label: 'Más recientes' },
  { id: 'duration', label: 'Duración' },
  { id: 'price_asc', label: 'Caché: menor a mayor' },
  { id: 'price_desc', label: 'Caché: mayor a menor' },
]

export default function ShowsPage() {
  useDocumentTitle('Espectáculos')
  const { tax } = useTaxonomies()
  const countries = configService.countries()

  const filterDefs = useMemo(() => [
    { key: 'discipline', primary: true, label: 'Disciplina', type: 'select', options: tax.disciplines },
    { key: 'genre', label: 'Género', type: 'select', placeholder: 'Todos', options: tax.genres },
    { key: 'durationMax', primary: true, label: 'Duración máxima (min)', chipLabel: 'Hasta', unit: 'min', type: 'number', placeholder: 'Ej. 60' },
    { key: 'castMax', label: 'Intérpretes (máximo)', chipLabel: 'Hasta', unit: 'intérpretes', type: 'number', placeholder: 'Ej. 4' },
    { key: 'audience', label: 'Público', type: 'select', placeholder: 'Todos', options: tax.audiences },
    { key: 'technicalNeeds', label: 'Necesidades técnicas', type: 'select', options: tax.technicalNeeds },
    { key: 'stagingFormat', label: 'Formato de montaje', type: 'select', placeholder: 'Todos', options: tax.stagingFormats },
    { key: 'bookingMode', primary: true, label: 'Modalidad de contratación', type: 'select', options: tax.bookingModes },
    { key: 'touring', primary: true, label: 'Disponible para giras', type: 'toggle' },
    { key: 'country', label: 'País', type: 'select', placeholder: 'Todos', options: countries.map((c) => ({ id: c.code, label: c.name })) },
    { key: 'city', label: 'Ciudad', type: 'select', options: countries[0].cities.map((c) => ({ id: c.name, label: c.name })) },
    { key: 'availability', label: 'Disponibilidad', type: 'select', options: Object.entries(SHOW_AVAILABILITY).map(([id, v]) => ({ id, label: v.label })) },
  ], [tax, countries])

  return (
    <>
      <PageHeader area="area-shows" eyebrow="Espectáculos" title="Obras para programar."
        description="Espectáculos disponibles para salas, festivales y giras."
        breadcrumbs={[{ label: 'Inicio', to: '/' }, { label: 'Espectáculos' }]}
        actions={<Button variant="secondary" to="/publicar/espectaculo">Publicar un espectáculo</Button>} />
      <CatalogView filterDefs={filterDefs} sortOptions={SORTS} fetcher={showsService.list}
        searchPlaceholder="Buscar por título, compañía o tema" itemNoun={['espectáculo', 'espectáculos']}
        emptyTitle="No encontramos espectáculos con esos filtros" renderItem={(s) => <ShowCard show={s} />} />
    </>
  )
}
