import { Link } from 'react-router-dom'
import { CalendarClock, MapPin, Building, Coins } from 'lucide-react'
import { StatusBadge, Badge } from '@/components/ui/StatusBadge'
import { FavoriteButton } from '@/features/favorites/FavoriteButton'
import { CardMeta } from './EntityCard'
import { useTaxonomies } from '@/hooks/useTaxonomies'
import { formatDate } from '@/utils/format'
import { daysUntil } from '@/utils/dates'

// Las convocatorias no llevan foto: lo importante es la fecha límite.
export function OpportunityCard({ opportunity: o }) {
  const { label } = useTaxonomies()
  const left = daysUntil(o.deadline)
  const open = o.publicState === 'published'
  return (
    <article className="lift group relative flex flex-col rounded-[var(--radius-card)] bg-surface p-6 shadow-[var(--shadow-card)]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          <StatusBadge status={o.publicState} label={open ? 'Abierta' : undefined} />
          {open && left <= 14 && <Badge tone="warning">Cierra en {left} {left === 1 ? 'día' : 'días'}</Badge>}
        </div>
        <FavoriteButton type="opportunity" id={o.id} title={o.title} className="relative z-10 -mr-1 -mt-1 shadow-none" />
      </div>
      <p className="eyebrow mt-3">{label('opportunityTypes', o.opportunityType)}</p>
      <h3 className="mt-1 font-display text-xl font-semibold leading-tight">
        <Link to={`/oportunidades/${o.slug}`} className="after:absolute after:inset-0">{o.title}</Link>
      </h3>
      <div className="mt-3 space-y-1.5 text-sm text-ink-soft">
        <CardMeta icon={Building}>{o.organizationName}</CardMeta>
        <CardMeta icon={MapPin}>{o.location.scope}</CardMeta>
        <CardMeta icon={Coins}>{label('compensation', o.compensation.type)}</CardMeta>
      </div>
      <p className="mt-5 inline-flex w-fit items-center gap-1.5 rounded-full bg-brand-soft px-3 py-1.5 text-sm font-semibold text-brand">
        <CalendarClock aria-hidden className="size-4 text-brand" />
        Fecha límite: {formatDate(o.deadline)}
      </p>
    </article>
  )
}
