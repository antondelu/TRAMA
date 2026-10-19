import { Clock, Users, Handshake, MapPin } from 'lucide-react'
import { EntityCard, CardMeta } from './EntityCard'
import { Badge } from '@/components/ui/StatusBadge'
import { useTaxonomies } from '@/hooks/useTaxonomies'
import { formatDuration } from '@/utils/format'

export const SHOW_AVAILABILITY = {
  disponible: { label: 'Disponible', tone: 'success' },
  consultar: { label: 'Consultar fechas', tone: 'warning' },
  'no-disponible': { label: 'Sin fechas por ahora', tone: 'neutral' },
}

export function ShowCard({ show }) {
  const { label, labels } = useTaxonomies()
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
      footer={<span className="text-xs">{show.touring ? 'Disponible para giras' : `Con base en ${show.city}`}</span>}
    >
      <p className="line-clamp-2 text-ink">{show.synopsis}</p>
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        <CardMeta icon={Clock}>{formatDuration(show.durationMinutes)}</CardMeta>
        <CardMeta icon={Users}>{show.castSize} {show.castSize === 1 ? 'intérprete' : 'intérpretes'}</CardMeta>
      </div>
      <CardMeta icon={Handshake}>{labels('bookingModes', show.bookingModes).join(', ')}</CardMeta>
      <CardMeta icon={MapPin}>{show.city}</CardMeta>
    </EntityCard>
  )
}
