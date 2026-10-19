import { useMemo } from 'react'
import { Megaphone, Search } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageContainer'
import { CatalogView } from '@/components/filters/CatalogView'
import { VenueCard } from '@/components/cards/VenueCard'
import { Button } from '@/components/ui/Button'
import { venuesService, configService } from '@/services'
import { useTaxonomies } from '@/hooks/useTaxonomies'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { todayISO } from '@/utils/dates'

const SORTS = [
  { id: 'relevance', label: 'Relevancia' },
  { id: 'name', label: 'Nombre (A-Z)' },
  { id: 'price_asc', label: 'Precio: menor a mayor' },
  { id: 'price_desc', label: 'Precio: mayor a menor' },
]

export default function VenuesPage() {
  useDocumentTitle('Salas')
  const { tax } = useTaxonomies()
  const uy = configService.countries()[0]

  const filterDefs = useMemo(() => [
    { key: 'department', primary: true, label: 'Departamento', type: 'select', placeholder: 'Todos', options: uy.departments.map((d) => ({ id: d, label: d })) },
    { key: 'city', label: 'Ciudad', type: 'select', options: uy.cities.map((c) => ({ id: c.name, label: c.name })) },
    { key: 'capMin', primary: true, label: 'Capacidad mínima', chipLabel: 'Desde', unit: 'personas', type: 'number', placeholder: 'Ej. 50' },
    { key: 'capMax', label: 'Capacidad máxima', chipLabel: 'Hasta', unit: 'personas', type: 'number', placeholder: 'Ej. 300' },
    { key: 'type', primary: true, label: 'Tipo de espacio', type: 'select', placeholder: 'Todos', options: tax.venueTypes },
    { key: 'rentalMode', label: 'Modalidad de alquiler', type: 'select', options: tax.rentalModes },
    { key: 'priceMin', label: 'Precio desde (UYU)', chipLabel: 'Precio desde', unit: 'UYU', type: 'number' },
    { key: 'priceMax', label: 'Precio hasta (UYU)', chipLabel: 'Precio hasta', unit: 'UYU', type: 'number' },
    { key: 'date', primary: true, label: 'Disponible el día', chipLabel: 'Libre el', type: 'date', min: todayISO(), hint: 'Solo salas que confirmaron esa fecha como libre.' },
    { key: 'openCalls', label: 'Con convocatorias abiertas', type: 'toggle' },
    { key: 'equipment', label: 'Equipamiento técnico', type: 'multi', options: tax.equipment },
    { key: 'accessibility', label: 'Accesibilidad', type: 'multi', options: tax.accessibility },
  ], [tax, uy])

  return (
    <>
      <PageHeader eyebrow="Salas" title="A veces no faltan salas, falta encontrarlas."
        description="TRAMA reúne espacios y muestra su disponibilidad en un solo lugar para que puedas conocerlos y encontrar el escenario ideal para tu proyecto."
        breadcrumbs={[{ label: 'Inicio', to: '/' }, { label: 'Salas' }]}
        actions={(
          <>
            <Button icon={Search} onClick={() => document.getElementById('catalog-q')?.focus()}>Explorar salas</Button>
            <Button variant="secondary" icon={Megaphone} to="/oportunidades?type=programacion">Convocatorias de programación</Button>
          </>
        )} />
      <CatalogView filterDefs={filterDefs} sortOptions={SORTS} fetcher={venuesService.list}
        searchPlaceholder="Buscar por nombre, barrio o ciudad" itemNoun={['sala', 'salas']}
        emptyTitle="No encontramos salas con esos filtros" renderItem={(v) => <VenueCard venue={v} />} />
    </>
  )
}
