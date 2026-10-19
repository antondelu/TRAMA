import { Link } from 'react-router-dom'
import { PageContainer } from '@/components/layout/PageContainer'
import { SPONSORS, SPONSOR_INVITE } from '@/config/sponsors'

// Franja de sponsors con formato de créditos de programa de mano: filetes
// dobles, temporada y "Con el apoyo de". Sin sponsors cargados, ofrece el
// espacio y lleva a Contacto.
export function SponsorStrip() {
  const year = new Date().getFullYear()
  return (
    <section aria-label="Sponsors de la temporada">
      <PageContainer className="pt-10">
        <div className="flex flex-col items-center gap-3 border-y-[3px] border-double border-ink/80 py-3 text-[0.7rem] font-bold uppercase tracking-[0.28em] text-ink-soft sm:flex-row sm:justify-between">
          <span>Temporada {year}</span>
          <span className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            <span className="text-ink-soft/70">Con el apoyo de</span>
            {SPONSORS.length > 0 ? SPONSORS.map((s) => (
              <a key={s.id} href={s.url} target="_blank" rel="noopener noreferrer sponsored" className="text-ink transition-colors hover:text-accent">
                {s.logo ? <img src={s.logo} alt={s.name} className="h-6 w-auto opacity-80 grayscale transition hover:opacity-100 hover:grayscale-0" /> : s.name}
              </a>
            )) : (
              <Link to="/contacto" className="rounded-full border border-dashed border-ink-soft/50 px-3 py-1 text-ink-soft transition-colors hover:border-accent hover:text-accent">
                {SPONSOR_INVITE}
              </Link>
            )}
          </span>
          <span>Uruguay</span>
        </div>
      </PageContainer>
    </section>
  )
}
