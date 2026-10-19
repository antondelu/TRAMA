import { Clock } from 'lucide-react'
import { EntityCard, CardMeta } from './EntityCard'
import { AccessBadge } from '@/components/ui/StatusBadge'
import { useTaxonomies } from '@/hooks/useTaxonomies'
import { formatDuration } from '@/utils/format'

// Versión minimalista: formato, autor, duración y acceso.
export function ResourceCard({ resource: r }) {
  const { label } = useTaxonomies()
  return (
    <EntityCard
      to={`/recursos/${r.slug}`}
      title={r.title}
      eyebrow={`${label('resourceTypes', r.resourceType)} · ${r.author}`}
      image={r.coverImage}
      kind={r.resourceType}
      favorite={{ type: 'resource', id: r.id }}
      badges={<AccessBadge accessLevel={r.accessLevel} />}
      cta="Ver recurso"
      footer={r.durationMinutes ? <CardMeta icon={Clock}>{formatDuration(r.durationMinutes)}</CardMeta> : null}
    />
  )
}
