import { Link } from 'react-router-dom'
import { Building } from 'lucide-react'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { FavoriteButton } from '@/features/favorites/FavoriteButton'
import { CardMeta } from './EntityCard'
import { useTaxonomies } from '@/hooks/useTaxonomies'
import { LOCALE } from '@/config/app'
import { cn, formatDate } from '@/utils/format'
import { daysUntil } from '@/utils/dates'

const monthFmt = new Intl.DateTimeFormat(LOCALE.language, { month: 'short', timeZone: 'UTC' })

// Hojita de almanaque con el día de cierre. En tono de alerta si cierra pronto.
function DeadlineLeaf({ iso, urgent }) {
  const d = new Date(`${iso}T00:00:00Z`)
  return (
    <span aria-hidden className={cn('flex w-14 shrink-0 flex-col overflow-hidden rounded-lg border bg-surface text-center shadow-[var(--shadow-card)] transition-transform duration-300 group-hover:-rotate-3',
      urgent ? 'border-warning/30' : 'border-line')}>
      <span className={cn('py-0.5 text-[0.65rem] font-bold uppercase tracking-wider text-white', urgent ? 'bg-warning' : 'bg-brand')}>{monthFmt.format(d).replace('.', '')}</span>
      <span className="pt-1 font-display text-2xl font-bold leading-none">{d.getUTCDate()}</span>
      <span className="pb-1 text-[0.6rem] text-ink-soft">{d.getUTCFullYear()}</span>
    </span>
  )
}

function countdown(left) {
  if (left === 0) return 'Cierra hoy'
  return `Faltan ${left} ${left === 1 ? 'día' : 'días'}`
}

// Las convocatorias no llevan foto: lo importante es la fecha límite.
export function OpportunityCard({ opportunity: o }) {
  const { label } = useTaxonomies()
  const left = daysUntil(o.deadline)
  const open = o.publicState === 'published'
  const urgent = open && left >= 0 && left <= 14
  return (
    <article className="lift group relative flex flex-col rounded-[var(--radius-card)] bg-surface p-6 shadow-[var(--shadow-card)]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          <StatusBadge status={o.publicState} label={open ? 'Abierta' : undefined} />
        </div>
        <FavoriteButton type="opportunity" id={o.id} title={o.title} className="relative z-10 -mr-1 -mt-1 shadow-none" />
      </div>
      <p className="eyebrow mt-3">{label('opportunityTypes', o.opportunityType)}</p>
      <h3 className="mt-1 font-display text-xl font-semibold leading-tight">
        <Link to={`/oportunidades/${o.slug}`} className="after:absolute after:inset-0">{o.title}</Link>
      </h3>
      <div className="mt-3 space-y-1.5 text-sm text-ink-soft">
        <CardMeta icon={Building}>{o.organizationName}</CardMeta>
      </div>
      {/* Pie troquelado: el cierre de la convocatoria. */}
      <div className="mt-auto pt-5">
        <div className="flex items-center gap-3 border-t-2 border-dashed border-line pt-4">
          <DeadlineLeaf iso={o.deadline} urgent={urgent} />
          <p className="text-sm leading-snug">
            <span className="block text-xs text-ink-soft">Cierre de la convocatoria</span>
            {open && left >= 0 ? (
              <><span className="sr-only">{formatDate(o.deadline)}. </span>
                <span className={cn('block font-semibold', urgent ? 'text-warning' : 'text-ink')}>{countdown(left)}</span></>
            ) : <span className="block font-semibold">{formatDate(o.deadline)}</span>}
          </p>
        </div>
      </div>
    </article>
  )
}
