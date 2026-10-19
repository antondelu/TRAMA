import { Clock, Users } from 'lucide-react'
import { EntityCard, CardMeta } from './EntityCard'
import { Badge } from '@/components/ui/StatusBadge'
import { useTaxonomies } from '@/hooks/useTaxonomies'
import { formatDuration } from '@/utils/format'

export const SHOW_AVAILABILITY = {
  disponible: { label: 'Disponible', tone: 'success' },
  consultar: { label: 'Consultar fechas', tone: 'warning' },
  'no-disponible': { label: 'Sin fechas por ahora', tone: 'neutral' },
}

// Versión minimalista: disciplina, compañía, duración e intérpretes.
export function ShowCard({ show }) {
  const { label } = useTaxonomies()
  const availability = SHOW_AVAILABILITY[show.availability]
  return (
    <EntityCard
      to={`/espectaculos/${show.slug}`}
      title={show.title}
      eyebrow={`${label('disciplines', show.discipline)} · ${show.company}`}
      image={show.media?.poster ?? show.media?.photos?.[0]?.url}
      kind="show"
      favorite={{ type: 'show', id: show.id }}
      badges={availability && <Badge tone={availability.tone}>{availability.label}</Badge>}
      cta="Ver espectáculo"
      footer={(
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-ink-soft">
          <CardMeta icon={Clock}>{formatDuration(show.durationMinutes)}</CardMeta>
          <CardMeta icon={Users}>{show.castSize} {show.castSize === 1 ? 'intérprete' : 'intérpretes'}</CardMeta>
        </div>
      )}
    />
  )
}
