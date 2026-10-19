import { Link } from 'react-router-dom'
import { ArrowRight, Sparkles } from 'lucide-react'
import { SearchBar } from '@/components/navigation/SearchBar'
import { Button } from '@/components/ui/Button'
import { PageContainer } from '@/components/layout/PageContainer'
import { COVER_TONES } from '@/components/media/Cover'
import { CATEGORIES } from '@/constants/navigation'
import { cn } from '@/utils/format'

// Mosaico de las cuatro áreas, levemente rotadas y flotando a distinto ritmo.
const TILT = ['-rotate-3', 'rotate-2 mt-8', 'rotate-2 -mt-6', '-rotate-2 mt-2']

function CategoryMosaic() {
  return (
    <nav aria-label="Accesos rápidos" className="grid grid-cols-2 gap-4 sm:gap-5">
      {CATEGORIES.map(({ id, label, to, icon: Icon, tone }, i) => {
        const t = COVER_TONES[tone]
        return (
          <div key={id} className="enter" style={{ '--d': `${300 + i * 120}ms` }}>
            <div className="float" style={{ '--d': `${i * -1500}ms` }}>
              <Link to={to}
                style={{ '--cover-base': t.base, '--cover-glow': t.glow, '--cover-glow-2': t.glow2, color: t.fg }}
                className={cn('cover-art group flex aspect-square flex-col justify-between rounded-[1.75rem] p-5 shadow-[var(--shadow-pop)] transition-transform duration-500 hover:rotate-0 hover:scale-[1.05] sm:p-6', TILT[i])}>
                <span className="flex size-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110">
                  <Icon aria-hidden className="size-6" strokeWidth={1.75} />
                </span>
                <span className="flex items-center justify-between font-display text-xl font-bold sm:text-2xl">
                  {label}
                  <ArrowRight aria-hidden className="size-5 -translate-x-2 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
                </span>
              </Link>
            </div>
          </div>
        )
      })}
    </nav>
  )
}

export function HeroSection() {
  return (
    <section aria-labelledby="hero-title" className="relative overflow-hidden">
      <div aria-hidden className="drift pointer-events-none absolute -left-40 top-10 size-[36rem] rounded-full bg-accent-soft blur-3xl" />
      <div aria-hidden className="drift pointer-events-none absolute -right-20 bottom-0 size-[28rem] rounded-full bg-brand-soft blur-3xl [animation-delay:-9s]" />
      <PageContainer className="relative grid items-center gap-12 py-14 sm:py-20 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
        <div>
          <p className="tag enter"><Sparkles aria-hidden className="size-3.5" />Mercado profesional de las artes escénicas</p>
          <h1 id="hero-title" className="enter mt-6 font-display text-5xl font-bold leading-[0.98] tracking-tight sm:text-7xl" style={{ '--d': '100ms' }}>
            Todo lo que necesitás para <span className="relative whitespace-nowrap text-accent">hacer teatro.
              <svg aria-hidden viewBox="0 0 300 12" preserveAspectRatio="none" className="absolute -bottom-2 left-0 h-3 w-full text-accent/35">
                <path className="draw" d="M2 9c60-6 140-8 296-3" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
              </svg>
            </span>
          </h1>
          <p className="enter mt-7 max-w-xl text-lg text-ink-soft" style={{ '--d': '200ms' }}>
            Encontrá espacios, descubrí espectáculos, conectá con profesionales y accedé a recursos para desarrollar tus proyectos.
          </p>
          <div className="enter" style={{ '--d': '300ms' }}>
            <SearchBar size="lg" className="mt-8 max-w-2xl transition-shadow focus-within:shadow-[var(--shadow-pop)]" />
          </div>
          <div className="enter mt-6 flex flex-wrap gap-3" style={{ '--d': '400ms' }}>
            <Button size="lg" to="/salas" iconRight={ArrowRight} className="group [&>svg:last-child]:transition-transform hover:[&>svg:last-child]:translate-x-1">Explorar TRAMA</Button>
            <Button size="lg" variant="secondary" to="/publicar">Publicar en TRAMA</Button>
          </div>
        </div>
        <div className="mx-auto w-full max-w-md lg:max-w-none">
          <CategoryMosaic />
        </div>
      </PageContainer>
    </section>
  )
}
