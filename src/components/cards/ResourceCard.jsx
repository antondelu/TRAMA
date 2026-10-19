import { Clock, User, Calendar } from 'lucide-react'
import { EntityCard, CardMeta } from './EntityCard'
import { AccessBadge, Badge } from '@/components/ui/StatusBadge'
import { useTaxonomies } from '@/hooks/useTaxonomies'
import { formatDuration, formatShortDate } from '@/utils/format'

export function ResourceCard({ resource: r }) {
  const { label } = useTaxonomies()
  return (
    <EntityCard
      to={`/recursos/${r.slug}`}
      title={r.title}
      eyebrow={label('resourceCategories', r.category)}
      image={r.coverImage}
      kind={r.resourceType}
      favorite={{ type: 'resource', id: r.id }}
      badges={<><AccessBadge accessLevel={r.accessLevel} /><Badge tone="neutral" className="bg-surface/95">{label('resourceTypes', r.resourceType)}</Badge></>}
      cta="Ver recurso"
      footer={<CardMeta icon={Calendar}>{formatShortDate(r.publishedAt)}</CardMeta>}
    >
      <CardMeta icon={User}>{r.author}</CardMeta>
      {r.durationMinutes && <CardMeta icon={Clock}>{formatDuration(r.durationMinutes)}</CardMeta>}
    </EntityCard>
  )
}
