import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { PageHeader, PageContainer } from '@/components/layout/PageContainer'
import { Hourglass } from '@/components/ui/Hourglass'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { NewsSection } from './NewsSection'

const MINUTE = 60_000

// Tiempo que falta, en horas y minutos (ej. "9 h 45 min").
function formatRemaining(ms) {
  const total = Math.ceil(ms / MINUTE)
  const h = Math.floor(total / 60)
  const m = total % 60
  return [h && `${h} h`, m && `${m} min`].filter(Boolean).join(' ')
}

// Hora actual, refrescada cada minuto para la cuenta regresiva.
function useNow() {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), MINUTE)
    return () => clearInterval(id)
  }, [])
  return now
}

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
  // Cuándo el servidor vuelve a consultar las fuentes (lo informa /api/news).
  const [nextRunAt, setNextRunAt] = useState(null)
  const onNextRunAt = useCallback((at) => setNextRunAt((prev) => (!prev || at > prev ? at : prev)), [])
  const now = useNow()
  const remaining = nextRunAt && new Date(nextRunAt).getTime() - now

  return (
    <>
      <PageHeader eyebrow="Noticias" title="Lo que pasa en la escena."
        description="Teatro, danza, música en vivo, circo y carnaval: noticias de Montevideo, del interior y del mundo, con enlace a cada medio."
        breadcrumbs={[{ label: 'Inicio', to: '/' }, { label: 'Noticias' }]} />
      <PageContainer className="space-y-16 py-10">
        <p className="flex items-center gap-2 text-sm text-ink-soft">
          <Hourglass />
          <span>
            {!nextRunAt
              ? 'Se actualiza automáticamente cada hora.'
              : remaining > 0
                ? <>Buscaremos nuevas noticias para ti en <strong className="font-semibold text-ink">{formatRemaining(remaining)}</strong>.</>
                : 'En breve buscaremos nuevas noticias.'}
          </span>
        </p>
        <NewsSection section="uy" featured title="Uruguay"
          description="De Montevideo y de todos los departamentos del interior."
          filters={uyFilters} onFiltersChange={setUyFilters} onNextRunAt={onNextRunAt} />
        <NewsSection section="intl" title="Internacional"
          description="Latinoamérica primero, y lo más relevante del resto del mundo."
          className="border-t border-line pt-12"
          filters={intlFilters} onFiltersChange={setIntlFilters} onNextRunAt={onNextRunAt} />
        <p className="text-xs text-ink-soft">
          Los títulos, resúmenes e imágenes son de cada medio, que figura en cada noticia junto al enlace a la publicación original.
          TRAMA no reproduce los artículos completos.
        </p>
      </PageContainer>
    </>
  )
}
