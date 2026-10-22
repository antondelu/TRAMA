import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { PageHeader, PageContainer } from '@/components/layout/PageContainer'
import { CatalogView } from '@/components/filters/CatalogView'
import { ResourceCard } from '@/components/cards/ResourceCard'
import { Button } from '@/components/ui/Button'
import { resourcesService } from '@/services'
import { useTaxonomies } from '@/hooks/useTaxonomies'
import { useServiceQuery } from '@/hooks/useServiceQuery'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { ResourceCollections } from './ResourceCollections'

const SORTS = [
  { id: 'recent', label: 'Más recientes' },
  { id: 'relevance', label: 'Relevancia' },
]

const TOPICS = [
  ['produccion', 'Producción'], ['gestion', 'Gestión'], ['giras', 'Giras'], ['tecnica', 'Técnica'], ['iluminacion', 'Iluminación'],
  ['formacion', 'Formación'], ['financiacion', 'Financiación'], ['contratacion', 'Contratación'], ['convocatorias', 'Convocatorias'],
].map(([id, label]) => ({ id, label }))

export default function ResourcesPage() {
  useDocumentTitle('Recursos')
  const { tax } = useTaxonomies()
  const [params] = useSearchParams()
  const { data: authors = [] } = useServiceQuery(() => resourcesService.authors(), [])
  // Las colecciones editoriales se muestran solo en la vista sin filtros.
  const browsing = [...params.keys()].length === 0

  const filterDefs = useMemo(() => [
    { key: 'type', primary: true, label: 'Formato', type: 'select', placeholder: 'Todos', options: tax.resourceTypes },
    { key: 'category', primary: true, label: 'Categoría', type: 'select', options: tax.resourceCategories },
    { key: 'topic', label: 'Tema', type: 'select', placeholder: 'Todos', options: TOPICS },
    { key: 'author', label: 'Autor', type: 'select', placeholder: 'Todos', options: authors.map((a) => ({ id: a, label: a })) },
    { key: 'access', primary: true, label: 'Acceso', type: 'select', placeholder: 'Todos', options: [{ id: 'free', label: 'Gratuito' }, { id: 'exclusive', label: 'Exclusivo para miembros' }] },
  ], [tax, authors])

  return (
    <>
      <PageHeader area="area-recursos" eyebrow="Recursos" title="Biblioteca profesional."
        description="Guías, entrevistas, plantillas y formación."
        breadcrumbs={[{ label: 'Inicio', to: '/' }, { label: 'Recursos' }]}
        actions={<Button variant="secondary" to="/planes">Ver membresías</Button>} />
      {browsing && <PageContainer className="pt-10"><ResourceCollections /></PageContainer>}
      <CatalogView filterDefs={filterDefs} sortOptions={SORTS} fetcher={resourcesService.list}
        searchPlaceholder="Buscar guías, entrevistas, plantillas…" itemNoun={['recurso', 'recursos']}
        emptyTitle="No encontramos recursos con esos filtros" renderItem={(r) => <ResourceCard resource={r} />} />
    </>
  )
}
