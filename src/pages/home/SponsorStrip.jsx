import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { PageContainer } from '@/components/layout/PageContainer'
import { Button } from '@/components/ui/Button'
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
  const number = `${row}${index + 1}`
  const aisle = index === SEATS_PER_ROW / 2 ? 'seat-aisle' : undefined

  // Sin animación de entrada: las butacas se ven siempre junto con el escenario
  // y las letras de fila, así el plano nunca queda vacío al hacer scroll.
  return (
    <li className={aisle}>
      <span className="block">
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
          <Link to="/contacto?tema=butaca" tabIndex={-1} aria-hidden className="map-seat free">
            <span className="seat-tip">{number} · Disponible · Auspiciá esta butaca</span>
          </Link>
        )}
      </span>
    </li>
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
      className={cn('sponsor-card group flex w-40 shrink-0 flex-col items-center gap-2 border border-line bg-surface px-3 py-3 text-center', active && 'is-active')}>
      <span className="flex h-9 w-full items-center justify-center">
        {sponsor.logo
          ? <img src={sponsor.logo} alt={`Logo de ${sponsor.name}`} className="h-9 w-auto max-w-full object-contain" />
          : <span className="font-display text-base font-bold">{sponsor.name}</span>}
      </span>
      <span>
        <span className="block text-xs font-semibold">{sponsor.name}</span>
        <span className="data mt-0.5 inline-flex items-center gap-1.5 text-sm text-ink-soft">
          <span aria-hidden className="map-seat taken [--seat:0.85rem]" />Butaca {seat}
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
    <section aria-labelledby="sponsors-title" className="border-y-2 border-ink bg-surface py-12 sm:py-16">
      <PageContainer className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] lg:items-center">
        <Reveal>
          <p className="eyebrow">Temporada {year}</p>
          <h2 id="sponsors-title" className="mt-2 font-display text-4xl font-extrabold leading-none sm:text-5xl">El teatro lo hacemos juntos</h2>
          <p className="mt-4 max-w-md text-lg text-ink-soft">Cada butaca ocupada es una marca que apoya a la escena. Pasá el mouse o tocá una para ver quién es.</p>
          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
            <span className="flex items-center gap-2 text-ink-soft">
              <span aria-hidden className="map-seat free [--seat:1.1rem]" />Butaca disponible
            </span>
            <Button variant="secondary" to="/contacto?tema=butaca" iconRight={ArrowRight}>Auspiciá una butaca</Button>
          </div>
          {SPONSORS.some((s) => s.demo) && <p className="mt-3 text-sm text-ink-soft">Marcas ficticias de demostración.</p>}
        </Reveal>

        <div className="seat-map min-w-0 pb-2">
          <div className="seat-map-inner mx-auto w-max px-2">
            {/* Escenario: la boca curva, como en el plano de una boletería. */}
            <div aria-hidden className="relative mx-auto mb-8 h-10 w-[85%]">
              <svg viewBox="0 0 400 40" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
                <path d="M2 4 Q200 52 398 4" fill="none" stroke="var(--color-ink)" strokeOpacity="0.55" strokeWidth="2.5" />
              </svg>
              <span className="data absolute inset-x-0 top-0 text-center text-sm uppercase text-ink-soft">Escenario</span>
            </div>
            {/* Filas */}
            <div className="space-y-3">
              {ROWS.map((row) => (
                <div key={row} className="flex items-center gap-3">
                  <span aria-hidden className="data w-4 text-sm text-ink-soft">{row}</span>
                  <ul className="seat-row flex" aria-label={`Fila ${row}`}>
                    {map[row].map((sponsor, i) => (
                      <Seat key={`${row}${i}`} row={row} index={i} sponsor={sponsor} active={sponsor && hovered === sponsor.id} onHover={setHovered} />
                    ))}
                  </ul>
                  <span aria-hidden className="data w-4 text-sm text-ink-soft">{row}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </PageContainer>

      <PageContainer>
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

      </PageContainer>
    </section>
  )
}
