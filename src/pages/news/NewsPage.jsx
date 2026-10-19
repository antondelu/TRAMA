import { useCallback, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { RefreshCw } from 'lucide-react'
import { PageHeader, PageContainer } from '@/components/layout/PageContainer'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { LOCALE } from '@/config/app'
import { NewsSection } from './NewsSection'

const updatedFmt = new Intl.DateTimeFormat(LOCALE.language, { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit', timeZone: LOCALE.timezone })

// Filtros de cada bloque en la URL, con nombres propios, para poder compartir
// la vista filtrada y que "atrás" funcione.
const PARAMS = {
  uy: { discipline: 'disciplina', location: 'lugar' },
  intl: { discipline: 'disciplina_int', location: 'lugar_int' },
}

function useSectionFilters(section) {
  const [params, setParams] = useSearchParams()
  const keys = PARAMS[section]
  const filters = { discipline: params.get(keys.discipline) ?? '', location: params.get(keys.location) ?? '' }
  const setFilters = (next) => setParams((prev) => {
    const p = new URLSearchParams(prev)
    for (const [field, key] of Object.entries(keys)) {
      if (next[field]) p.set(key, next[field])
      else p.delete(key)
    }
    return p
  }, { replace: true, preventScrollReset: true })
  return [filters, setFilters]
}

export default function NewsPage() {
  useDocumentTitle('Noticias')
  const [uyFilters, setUyFilters] = useSectionFilters('uy')
  const [intlFilters, setIntlFilters] = useSectionFilters('intl')
  const [updatedAt, setUpdatedAt] = useState(null)
  const onUpdatedAt = useCallback((at) => setUpdatedAt((prev) => (!prev || at > prev ? at : prev)), [])

  return (
    <>
      <PageHeader eyebrow="Noticias" title="Lo que pasa en la escena."
        description="Teatro, danza, música en vivo, circo y carnaval: noticias de Montevideo, del interior y del mundo, con enlace a cada medio."
        breadcrumbs={[{ label: 'Inicio', to: '/' }, { label: 'Noticias' }]} />
      <PageContainer className="space-y-16 py-10">
        <p className="flex items-center gap-2 text-sm text-ink-soft">
          <RefreshCw aria-hidden className="size-4" />
          <span>
            {updatedAt
              ? <>Última actualización: <time dateTime={updatedAt}>{updatedFmt.format(new Date(updatedAt))}</time>. Se actualiza cada 12 horas.</>
              : 'Se actualiza automáticamente cada 12 horas.'}
          </span>
        </p>
        <NewsSection section="uy" featured title="Uruguay"
          description="De Montevideo y de todos los departamentos del interior."
          filters={uyFilters} onFiltersChange={setUyFilters} onUpdatedAt={onUpdatedAt} />
        <NewsSection section="intl" title="Internacional"
          description="Latinoamérica primero, y lo más relevante del resto del mundo."
          className="border-t border-line pt-12"
          filters={intlFilters} onFiltersChange={setIntlFilters} onUpdatedAt={onUpdatedAt} />
        <p className="text-xs text-ink-soft">
          Los títulos, resúmenes e imágenes son de cada medio, que figura en cada noticia junto al enlace a la publicación original.
          TRAMA no reproduce los artículos completos.
        </p>
      </PageContainer>
    </>
  )
}
