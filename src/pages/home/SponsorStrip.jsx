import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { PageContainer } from '@/components/layout/PageContainer'
import { Reveal } from '@/components/ui/Reveal'
import { SPONSORS } from '@/config/sponsors'
import { cn } from '@/utils/format'

const ROWS = ['A', 'B']
const SEATS_PER_ROW = 12 // con pasillo central entre la 6 y la 7

// Orden de las butacas desde el centro hacia afuera: los sponsors ocupan los
// mejores lugares de la primera fila.
function centerFirst(count) {
  const mid = (count - 1) / 2
  return Array.from({ length: count }, (_, i) => i).sort((a, b) => Math.abs(a - mid) - Math.abs(b - mid) || a - b)
}

// Devuelve el plano (fila -> butacas) y la butaca asignada a cada sponsor.
function buildMap() {
  const map = Object.fromEntries(ROWS.map((r) => [r, Array(SEATS_PER_ROW).fill(null)]))
  const seatOf = {}
  const order = ROWS.flatMap((r) => centerFirst(SEATS_PER_ROW).map((i) => [r, i]))
  SPONSORS.slice(0, order.length - 2).forEach((s, k) => {
    const [r, i] = order[k]
    map[r][i] = s
    seatOf[s.id] = `${r}${i + 1}`
  })
  return { map, seatOf }
}

function Seat({ row, index, sponsor, active, onHover }) {
  const mid = (SEATS_PER_ROW - 1) / 2
  const d = Math.abs(index - mid)
  // Curva de la platea: las butacas de los costados quedan más cerca del escenario.
  const curve = { transform: `translateY(${-(d * d) * 0.35}px)` }
  const number = `${row}${index + 1}`
  const delay = ROWS.indexOf(row) * 250 + d * 45
  const aisle = index === SEATS_PER_ROW / 2 ? 'ml-6 sm:ml-10' : ''

  return (
    <Reveal as="li" delay={delay} className={aisle}>
      <span className="block" style={curve}>
        {sponsor ? (
          <a href={sponsor.url} target="_blank" rel="noopener noreferrer sponsored"
            className={cn('map-seat taken', active && 'is-active')} aria-label={`${sponsor.name}, butaca ${number}`}
            onMouseEnter={() => onHover(sponsor.id)} onMouseLeave={() => onHover(null)} onFocus={() => onHover(sponsor.id)} onBlur={() => onHover(null)}>
            <span className="seat-tip flex items-center gap-2">
              {sponsor.logo && <img src={sponsor.logo} alt="" className="h-6 w-auto rounded bg-white p-0.5" />}
              <span>{sponsor.name} · {number}</span>
            </span>
          </a>
        ) : (
          // Las butacas libres repiten el enlace "Auspiciá una butaca": fuera del orden de tabulación.
          <Link to="/contacto" tabIndex={-1} aria-hidden className="map-seat free">
            <span className="seat-tip">{number} · Disponible · Auspiciá esta butaca</span>
          </Link>
        )}
      </span>
    </Reveal>
  )
}

// Cuántas veces se repite la lista en la cinta: al menos ~16 tarjetas para
// cubrir pantallas anchas, y siempre un número par (la animación corre -50%).
function marqueeReps(count) {
  const reps = Math.max(2, Math.ceil(16 / count))
  return reps % 2 ? reps + 1 : reps
}

// Tarjeta de sponsor: logo, nombre y butaca. Conectada con el plano.
// `copy`: repetición para que la cinta sea continua (oculta a lectores de pantalla).
function SponsorCard({ sponsor, seat, active, onHover, copy = false }) {
  return (
    <a href={sponsor.url} target="_blank" rel="noopener noreferrer sponsored"
      aria-hidden={copy || undefined} tabIndex={copy ? -1 : undefined}
      onMouseEnter={() => onHover(sponsor.id)} onMouseLeave={() => onHover(null)} onFocus={() => onHover(sponsor.id)} onBlur={() => onHover(null)}
      className={cn('sponsor-card group flex w-40 shrink-0 flex-col items-center gap-2 rounded-2xl bg-surface px-3 py-3 text-center shadow-[var(--shadow-card)]', active && 'is-active')}>
      <span className="flex h-9 w-full items-center justify-center">
        {sponsor.logo
          ? <img src={sponsor.logo} alt={`Logo de ${sponsor.name}`} className="h-9 w-auto max-w-full object-contain" />
          : <span className="font-display text-base font-bold">{sponsor.name}</span>}
      </span>
      <span>
        <span className="block text-xs font-semibold">{sponsor.name}</span>
        <span className="mt-0.5 inline-flex items-center gap-1.5 text-[0.7rem] text-ink-soft">
          <span aria-hidden className="map-seat taken !h-3 !w-3.5" />Butaca {seat}
        </span>
      </span>
    </a>
  )
}

// Platea de sponsors: plano de sala (como el mapa de una boletería) y, debajo,
// cada sponsor con su logo. Los sponsors se cargan en src/config/sponsors.js.
export function SponsorStrip() {
  const year = new Date().getFullYear()
  const { map, seatOf } = buildMap()
  const [hovered, setHovered] = useState(null)

  return (
    <section aria-labelledby="sponsors-title" className="relative overflow-hidden pb-12 pt-12">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-[radial-gradient(50%_100%_at_50%_0%,rgb(255_241_214_/_0.6),transparent)]" />
      <PageContainer className="relative">
        <Reveal className="text-center">
          <p className="text-[0.7rem] font-bold uppercase tracking-[0.28em] text-ink-soft">Temporada {year}</p>
          <h2 id="sponsors-title" className="mt-2 font-display text-xl font-bold">Sponsors de la temporada</h2>
        </Reveal>

        <div className="mx-auto mt-8 max-w-2xl overflow-x-auto pb-2">
          <div className="mx-auto w-max px-2 pt-10">
            {/* Escenario */}
            <div aria-hidden className="relative mx-auto mb-8 h-10 w-[85%]">
              <svg viewBox="0 0 400 40" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
                <path d="M2 4 Q200 52 398 4" fill="none" stroke="var(--color-ink)" strokeOpacity="0.35" strokeWidth="2" />
              </svg>
              <span className="absolute inset-x-0 top-0 text-center text-[0.65rem] font-bold uppercase tracking-[0.35em] text-ink-soft">Escenario</span>
            </div>
            {/* Filas */}
            <div className="space-y-3">
              {ROWS.map((row) => (
                <div key={row} className="flex items-center gap-3">
                  <span aria-hidden className="w-4 text-xs font-bold text-ink-soft">{row}</span>
                  <ul className="flex gap-1.5 sm:gap-2" aria-label={`Fila ${row}`}>
                    {map[row].map((sponsor, i) => (
                      <Seat key={`${row}${i}`} row={row} index={i} sponsor={sponsor} active={sponsor && hovered === sponsor.id} onHover={setHovered} />
                    ))}
                  </ul>
                  <span aria-hidden className="w-4 text-xs font-bold text-ink-soft">{row}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sponsors con logo */}
        {/* Cinta de sponsors: avanza despacio hacia el costado y se frena al pasar
            el mouse. Así entran todas las marcas aunque se llene la platea. */}
        {SPONSORS.length > 0 && (
          <Reveal className="sponsor-marquee mt-10">
            <div className="sponsor-track" style={{ '--marquee-duration': `${Math.max(20, SPONSORS.length * 6)}s` }}>
              {Array.from({ length: marqueeReps(SPONSORS.length) }, (_, rep) =>
                SPONSORS.map((s) => (
                  <SponsorCard key={`${rep}-${s.id}`} copy={rep > 0} sponsor={s} seat={seatOf[s.id]} active={hovered === s.id} onHover={setHovered} />
                )))}
            </div>
          </Reveal>
        )}

        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm">
          <span className="flex items-center gap-2 text-ink-soft">
            <span aria-hidden className="map-seat free !h-3.5 !w-4" />Butaca disponible
          </span>
          <Link to="/contacto" className="inline-flex items-center gap-1 font-semibold text-[#743B45] hover:underline">
            Auspiciá una butaca<ArrowRight aria-hidden className="size-4" />
          </Link>
        </div>
        {SPONSORS.some((s) => s.demo) && <p className="mt-3 text-center text-xs text-ink-soft">Marcas ficticias de demostración.</p>}
      </PageContainer>
    </section>
  )
}
