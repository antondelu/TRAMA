import { useMemo } from 'react'
import { PageHeader } from '@/components/layout/PageContainer'
import { CatalogView } from '@/components/filters/CatalogView'
import { ProfessionalCard } from '@/components/cards/ProfessionalCard'
import { Button } from '@/components/ui/Button'
import { servicesService, configService } from '@/services'
import { useTaxonomies } from '@/hooks/useTaxonomies'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

const SORTS = [
  { id: 'relevance', label: 'Relevancia' },
  { id: 'name', label: 'Nombre (A-Z)' },
  { id: 'experience', label: 'Más experiencia' },
  { id: 'price_asc', label: 'Precio: menor a mayor' },
]

export default function ServicesPage() {
  useDocumentTitle('Servicios')
  const { tax } = useTaxonomies()
  const uy = configService.countries()[0]

  const filterDefs = useMemo(() => [
    { key: 'specialty', label: 'Especialidad', type: 'select', options: tax.specialties },
    { key: 'department', label: 'Departamento', type: 'select', placeholder: 'Todos', options: uy.departments.map((d) => ({ id: d, label: d })) },
    { key: 'city', label: 'Ciudad', type: 'select', options: uy.cities.map((c) => ({ id: c.name, label: c.name })) },
    { key: 'availability', label: 'Disponibilidad', type: 'select', options: tax.serviceAvailability },
    { key: 'workMode', label: 'Modalidad', type: 'select', options: tax.workModes },
    { key: 'priceMax', label: 'Precio orientativo hasta (UYU)', chipLabel: 'Hasta', unit: 'UYU', type: 'number' },
    { key: 'experience', label: 'Experiencia', type: 'select', options: tax.experienceLevels },
    { key: 'providerType', label: 'Tipo de proveedor', type: 'select', placeholder: 'Todos', options: tax.providerTypes },
    { key: 'offered', label: 'Servicio ofrecido', type: 'select', placeholder: 'Cualquiera', options: [
      { id: 'diseño', label: 'Diseño' }, { id: 'operación', label: 'Operación en funciones' }, { id: 'alquiler', label: 'Alquiler' },
      { id: 'prensa', label: 'Prensa' }, { id: 'fotografía', label: 'Fotografía' }, { id: 'traducción', label: 'Traducción' },
    ] },
  ], [tax, uy])

  return (
    <>
      <PageHeader eyebrow="Servicios" title="Profesionales para tu proyecto."
        description="Directorio de personas, empresas y cooperativas que trabajan en artes escénicas. Consultá y pedí presupuesto desde la plataforma."
        breadcrumbs={[{ label: 'Inicio', to: '/' }, { label: 'Servicios' }]}
        actions={<Button variant="secondary" to="/publicar/servicio">Ofrecer mis servicios</Button>} />
      <CatalogView filterDefs={filterDefs} sortOptions={SORTS} fetcher={servicesService.list}
        searchPlaceholder="Buscar por nombre, especialidad o servicio" itemNoun={['profesional', 'profesionales']}
        emptyTitle="No encontramos profesionales con esos filtros" renderItem={(p) => <ProfessionalCard pro={p} />} />
    </>
  )
}
