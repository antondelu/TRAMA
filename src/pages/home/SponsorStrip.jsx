import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { PageContainer } from '@/components/layout/PageContainer'
import { Reveal } from '@/components/ui/Reveal'
import { SPONSORS } from '@/config/sponsors'

const MIN_SEATS = 6

function TakenSeat({ sponsor, number }) {
  const content = sponsor.logo
    ? <img src={sponsor.logo} alt={sponsor.name} className="max-h-10 w-auto brightness-0 invert" />
    : <span className="font-display text-sm font-bold leading-tight">{sponsor.name}</span>
  return (
    <a href={sponsor.url} target="_blank" rel="noopener noreferrer sponsored" className="seat taken" aria-label={`${sponsor.name} (butaca ${number})`}>
      <span className="seat-back">{content}</span>
      <span aria-hidden className="seat-cushion" />
      <span aria-hidden className="seat-legs" />
      <span aria-hidden className="seat-number">{number}</span>
    </a>
  )
}

// Butaca libre: el asiento está plegado, como en una sala vacía. Al pasar el
// mouse se baja e invita a auspiciar.
function FreeSeat({ number }) {
  return (
    <Link to="/contacto" className="seat free focus-visible:outline-none" aria-label={`Butaca ${number} disponible: auspiciá esta butaca`}>
      <span className="seat-back">
        <Plus aria-hidden className="size-5" />
        <span className="seat-idle text-xs font-semibold">Disponible</span>
        <span className="seat-invite text-xs font-semibold leading-tight">Auspiciá esta butaca</span>
      </span>
      <span aria-hidden className="seat-cushion" />
      <span aria-hidden className="seat-legs" />
      <span aria-hidden className="seat-number">{number}</span>
    </Link>
  )
}

// Platea de sponsors: una fila de butacas frente al escenario del hero.
// Las ocupan los sponsors (src/config/sponsors.js); siempre quedan libres
// para invitar a sumarse.
export function SponsorStrip() {
  const year = new Date().getFullYear()
  const total = Math.max(MIN_SEATS, SPONSORS.length + 2)
  const seats = Array.from({ length: total }, (_, i) => SPONSORS[i] ?? null)

  return (
    <section aria-labelledby="sponsors-title" className="relative overflow-hidden pb-6 pt-12">
      {/* Luz cálida que llega desde el escenario */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(50%_100%_at_50%_0%,rgb(255_241_214_/_0.6),transparent)]" />
      <PageContainer className="relative">
        <Reveal className="text-center">
          <p className="text-[0.7rem] font-bold uppercase tracking-[0.28em] text-ink-soft">Fila A · Temporada {year}</p>
          <h2 id="sponsors-title" className="mt-2 font-display text-xl font-bold">Sponsors de la temporada</h2>
        </Reveal>
        <ul className="mx-auto mt-8 flex max-w-5xl flex-wrap justify-center gap-x-4 gap-y-8">
          {seats.map((sponsor, i) => (
            <Reveal as="li" key={sponsor?.id ?? `free-${i}`} delay={i * 90}>
              {sponsor ? <TakenSeat sponsor={sponsor} number={`A${i + 1}`} /> : <FreeSeat number={`A${i + 1}`} />}
            </Reveal>
          ))}
        </ul>
      </PageContainer>
    </section>
  )
}
