import { useMemo, useState } from 'react'
import { ArrowUpRight, X } from 'lucide-react'
import { PageContainer } from '@/components/layout/PageContainer'
import { Reveal } from '@/components/ui/Reveal'
import { Skeleton } from '@/components/ui/States'
import { MontevideoMap } from '@/components/maps/MontevideoMap'
import { dayLabel, longDayLabel, liveStatus, ticketPrice, updatedLabel } from '@/features/performances/format'
import { performancesService } from '@/services'
import { useServiceQuery } from '@/hooks/useServiceQuery'
import { useNow } from '@/hooks/useNow'
import { todayISO } from '@/utils/dates'
import { safeHttpUrl } from '@/utils/url'
import { cn, plural } from '@/utils/format'

// Color del aro de los puntos: más oscuro que el fondo, para que se recorten.
const RING = '#5E1F41'
// Cuántas funciones se ven antes del botón "Ver las N funciones".
const PREVIEW = 4

// Un punto por sala, aunque tenga más de una función ese día.
function spotsFrom(list, now) {
  const byPlace = new Map()
  for (const p of list) {
    if (p.place.lat == null) continue
    const spot = byPlace.get(p.place.id) ?? { ...p.place, barrio: p.place.address ?? '', count: 0, live: false }
    spot.count += 1
    spot.live ||= Boolean(liveStatus(p, now)?.live)
    byPlace.set(p.place.id, spot)
  }
  return [...byPlace.values()]
}

const external = { target: '_blank', rel: 'noopener noreferrer' }

function PerformanceRow({ p, now, highlighted, onActivate }) {
  const status = liveStatus(p, now)
  const info = safeHttpUrl(p.sourceUrl ?? p.ticketUrl, { httpsOnly: true })
  const tickets = !p.soldOut && safeHttpUrl(p.ticketUrl, { httpsOnly: true })
  return (
    <li onMouseEnter={() => onActivate(p.place.id)} onMouseLeave={() => onActivate(null)}
      className={cn('grid grid-cols-[4.25rem_minmax(0,1fr)] gap-x-4 border-t border-white/15 py-3.5 transition-colors', highlighted && 'bg-white/[0.06]')}>
      <span className="data pt-0.5 text-2xl font-bold tabular-nums text-white">{p.time}</span>
      <div className="min-w-0">
        <a href={info ?? undefined} {...external} onFocus={() => onActivate(p.place.id)} onBlur={() => onActivate(null)}
          className="font-display text-lg font-bold leading-tight text-white underline-offset-4 hover:underline focus-visible:underline">
          {p.title}<span className="sr-only"> (abre en otra pestaña)</span>
        </a>
        <p className="mt-0.5 text-sm text-white/75">{p.place.name}{p.place.address && <span className="text-white/55"> · {p.place.address}</span>}</p>
        <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-white/60">
          {p.genre && <span>{p.genre}</span>}
          <span className={cn(p.soldOut && 'font-bold text-white')}>{ticketPrice(p)}</span>
          {tickets && (
            <a href={tickets} {...external} className="inline-flex items-center gap-0.5 font-bold text-white underline decoration-white/40 underline-offset-2 hover:decoration-white">
              Entradas<ArrowUpRight aria-hidden className="size-3.5" /><span className="sr-only"> de {p.title} en RedTickets</span>
            </a>
          )}
          {status && (
            <span className={cn('eyebrow', status.live ? 'text-area-convocatorias' : 'text-white')}>
              {status.live && <span aria-hidden className="mr-1.5 inline-block size-2 rounded-full bg-area-convocatorias align-middle" />}
              {status.label}
            </span>
          )}
        </p>
      </div>
    </li>
  )
}

// Cartelera de teatro de Montevideo sobre el mapa: el día elegido, sala por sala.
export function TonightSection() {
  const today = todayISO()
  const now = useNow()
  const days = useServiceQuery(() => performancesService.nextDays(4), [today])
  const [picked, setPicked] = useState(null)
  // Si hoy ya no queda nada (de madrugada, por ejemplo), arranca en el próximo día con funciones.
  const firstWithShows = days.data?.find((d) => d.count > 0)?.date
  const date = picked ?? firstWithShows ?? today
  const list = useServiceQuery(() => performancesService.byDay(date), [date])
  const [hovered, setHovered] = useState(null)
  const [pinned, setPinned] = useState(null)
  const [expanded, setExpanded] = useState(false)

  const items = useMemo(() => list.data ?? [], [list.data])
  const spots = useMemo(() => spotsFrom(items, now), [items, now])
  const filtered = pinned ? items.filter((p) => p.place.id === pinned) : items
  const visible = expanded || pinned ? filtered : filtered.slice(0, PREVIEW)
  const pinnedPlace = spots.find((s) => s.id === pinned)
  const active = hovered ?? pinned
  const source = performancesService.source()

  function pickDay(d) {
    setPicked(d)
    setPinned(null)
    setExpanded(false)
  }

  // Cartelera vieja o vacía: la sección no aparece, en lugar de mostrar un mapa sin nada.
  if (days.data && !firstWithShows) return null

  return (
    <section aria-labelledby="tonight-title" className="overflow-hidden bg-area-shows-ink text-white">
      <PageContainer className="grid gap-8 py-14 sm:py-20 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)] lg:gap-x-12">
        <Reveal className="lg:col-start-1 lg:row-start-1">
          <p className="eyebrow text-area-convocatorias">Cartelera · Montevideo</p>
          <h2 id="tonight-title" className="mt-2 font-display text-5xl font-extrabold leading-[0.92] sm:text-6xl">
            {date === today ? 'Hoy hay función.' : <>Se viene <span className="block [font-stretch:72%]">{dayLabel(date, today).toLowerCase()}.</span></>}
          </h2>
          <p className="mt-3 text-white/75">
            {list.data
              ? `${longDayLabel(date)}: ${plural(items.length, 'función', 'funciones')} en ${plural(new Set(items.map((p) => p.place.id)).size, 'sala', 'salas')}.`
              : longDayLabel(date)}
          </p>
          {days.data && (
            <div role="group" aria-label="Elegir día" className="mt-5 flex flex-wrap gap-2">
              {days.data.map((d) => (
                <button key={d.date} type="button" aria-pressed={d.date === date} onClick={() => pickDay(d.date)} disabled={d.count === 0}
                  className={cn('inline-flex min-h-11 items-center gap-2 border-2 px-3.5 text-sm font-bold transition-colors disabled:opacity-40',
                    d.date === date ? 'border-white bg-white text-area-shows-ink' : 'border-white/40 hover:border-white')}>
                  {dayLabel(d.date, today)}
                  <span className={cn('data tabular-nums', d.date === date ? 'text-area-shows-ink/70' : 'text-white/60')}>{d.count}</span>
                </button>
              ))}
            </div>
          )}
        </Reveal>

        <div className="lg:sticky lg:top-24 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-start">
          <MontevideoMap spots={spots} activeId={active} onActivate={setHovered} ringColor={RING}
            onToggle={(id) => setPinned((cur) => (cur === id ? null : id))} />
          <p className="mt-2 text-xs text-white/55">Tocá un punto para ver solo esa sala. Límites: Intendencia de Montevideo.</p>
        </div>

        <div className="lg:col-start-1 lg:row-start-2">
          {pinnedPlace && (
            <button type="button" onClick={() => setPinned(null)}
              className="mb-3 inline-flex min-h-10 items-center gap-2 bg-area-convocatorias px-3 text-sm font-bold text-ink">
              Solo {pinnedPlace.name}
              <X aria-hidden className="size-4" /><span className="sr-only">(ver todas)</span>
            </button>
          )}
          {list.error && <p className="text-white/80">No pudimos cargar la cartelera. Probá de nuevo en un rato.</p>}
          {!list.data && !list.error && <div className="grid gap-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-16 bg-white/10" />)}</div>}
          {list.data && visible.length === 0 && <p className="border-t border-white/15 pt-4 text-white/80">No quedan funciones para este día.</p>}
          {visible.length > 0 && (
            <ul className="border-b border-white/15">
              {visible.map((p) => <PerformanceRow key={p.id} p={p} now={now} highlighted={active === p.place.id} onActivate={setHovered} />)}
            </ul>
          )}
          {!pinned && filtered.length > PREVIEW && (
            <button type="button" onClick={() => setExpanded((v) => !v)}
              className="mt-4 inline-flex min-h-11 items-center border-2 border-white/40 px-4 text-sm font-bold hover:border-white">
              {expanded ? 'Ver menos' : `Ver las ${filtered.length} funciones`}
            </button>
          )}
          <p className="mt-4 text-xs text-white/55">
            Fuente: {source.names.join(' y ')}. Actualizado el {updatedLabel(source.fetchedAt)}. Horarios y precios pueden cambiar: confirmá en la sala o en la boletería.
          </p>
        </div>
      </PageContainer>
    </section>
  )
}
