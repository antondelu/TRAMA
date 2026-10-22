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

// Hojita de almanaque con el día de cierre: ámbar de Convocatorias; en negro si cierra pronto.
function DeadlineLeaf({ iso, urgent }) {
  const d = new Date(`${iso}T00:00:00Z`)
  return (
    <span aria-hidden className="flex w-16 shrink-0 flex-col border-2 border-ink bg-surface text-center">
      <span className={cn('data py-0.5 text-sm uppercase', urgent ? 'bg-ink text-white' : 'bg-area-convocatorias text-ink')}>{monthFmt.format(d).replace('.', '')}</span>
      <span className="pt-1 font-display text-3xl font-extrabold leading-none [font-stretch:80%]">{d.getUTCDate()}</span>
      <span className="data pb-1 text-sm text-ink-soft">{d.getUTCFullYear()}</span>
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
    <article className="lift area-convocatorias group relative flex flex-col border border-line border-t-[6px] border-t-[var(--area)] bg-surface p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          <StatusBadge status={o.publicState} label={open ? 'Abierta' : undefined} />
        </div>
        <FavoriteButton type="opportunity" id={o.id} title={o.title} className="relative z-10 -mr-2 -mt-2" />
      </div>
      <p className="eyebrow mt-3 !text-[var(--area-ink)]">{label('opportunityTypes', o.opportunityType)}</p>
      <h3 className="mt-1 font-display text-xl font-bold leading-tight">
        <Link to={`/oportunidades/${o.slug}`} className="after:absolute after:inset-0">{o.title}</Link>
      </h3>
      <div className="mt-3 space-y-1.5 text-sm text-ink-soft">
        <CardMeta icon={Building}>{o.organizationName}</CardMeta>
      </div>
      {/* Pie: el cierre de la convocatoria. */}
      <div className="mt-auto pt-5">
        <div className="flex items-center gap-3 border-t border-line pt-4">
          <DeadlineLeaf iso={o.deadline} urgent={urgent} />
          <p className="text-sm leading-snug">
            <span className="block text-sm text-ink-soft">Cierre de la convocatoria</span>
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
