import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { PageContainer } from '@/components/layout/PageContainer'
import { Reveal } from '@/components/ui/Reveal'
import { SPONSORS } from '@/config/sponsors'

const ROWS = ['A', 'B']
const SEATS_PER_ROW = 12 // con pasillo central entre la 6 y la 7

// Orden de las butacas de la fila A desde el centro hacia afuera: los
// sponsors ocupan los mejores lugares.
function centerFirst(count) {
  const mid = (count - 1) / 2
  return Array.from({ length: count }, (_, i) => i).sort((a, b) => Math.abs(a - mid) - Math.abs(b - mid) || a - b)
}

function buildMap() {
  const map = Object.fromEntries(ROWS.map((r) => [r, Array(SEATS_PER_ROW).fill(null)]))
  const order = ROWS.flatMap((r) => centerFirst(SEATS_PER_ROW).map((i) => [r, i]))
  SPONSORS.slice(0, order.length - 2).forEach((s, k) => {
    const [r, i] = order[k]
    map[r][i] = s
  })
  return map
}

function Seat({ row, index, sponsor }) {
  const mid = (SEATS_PER_ROW - 1) / 2
  const d = Math.abs(index - mid)
  // Curva de la platea: las butacas de los costados quedan más cerca del escenario.
  const style = { transform: `translateY(${-(d * d) * 0.35}px)` }
  const number = `${row}${index + 1}`
  const delay = ROWS.indexOf(row) * 250 + d * 45
  const aisle = index === SEATS_PER_ROW / 2 ? 'ml-6 sm:ml-10' : ''

  return (
    <Reveal as="li" delay={delay} className={aisle}>
      <span className="block" style={style}>
      {sponsor ? (
        <a href={sponsor.url} target="_blank" rel="noopener noreferrer sponsored" className="map-seat taken" aria-label={`${sponsor.name}, butaca ${number}`}>
          <span className="seat-tip">{sponsor.name} · {number}</span>
        </a>
      ) : (
        // Las butacas libres repiten el enlace de la leyenda: fuera del orden de tabulación.
        <Link to="/contacto" tabIndex={-1} aria-hidden className="map-seat free">
          <span className="seat-tip">{number} · Disponible · Auspiciá esta butaca</span>
        </Link>
      )}
      </span>
    </Reveal>
  )
}

// Platea de sponsors como plano de sala (como el mapa de una boletería).
// Los sponsors se cargan en src/config/sponsors.js.
export function SponsorStrip() {
  const year = new Date().getFullYear()
  const map = buildMap()

  return (
    <section aria-labelledby="sponsors-title" className="relative overflow-hidden pb-10 pt-12">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-[radial-gradient(50%_100%_at_50%_0%,rgb(255_241_214_/_0.6),transparent)]" />
      <PageContainer className="relative">
        <Reveal className="text-center">
          <p className="text-[0.7rem] font-bold uppercase tracking-[0.28em] text-ink-soft">Temporada {year}</p>
          <h2 id="sponsors-title" className="mt-2 font-display text-xl font-bold">Sponsors de la temporada</h2>
        </Reveal>

        <div className="mx-auto mt-8 max-w-2xl overflow-x-auto pb-2">
          <div className="mx-auto w-max px-2">
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
                    {map[row].map((sponsor, i) => <Seat key={`${row}${i}`} row={row} index={i} sponsor={sponsor} />)}
                  </ul>
                  <span aria-hidden className="w-4 text-xs font-bold text-ink-soft">{row}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Leyenda */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm">
          {SPONSORS.map((s) => (
            <a key={s.id} href={s.url} target="_blank" rel="noopener noreferrer sponsored" className="flex items-center gap-2 font-semibold hover:text-[#743B45]">
              <span aria-hidden className="map-seat taken !h-3.5 !w-4" />{s.name}
            </a>
          ))}
          <span className="flex items-center gap-2 text-ink-soft">
            <span aria-hidden className="map-seat free !h-3.5 !w-4" />Butaca disponible
          </span>
          <Link to="/contacto" className="inline-flex items-center gap-1 font-semibold text-[#743B45] hover:underline">
            Auspiciá una butaca<ArrowRight aria-hidden className="size-4" />
          </Link>
        </div>
      </PageContainer>
    </section>
  )
}
