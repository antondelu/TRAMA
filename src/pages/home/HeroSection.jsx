import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { SearchBar } from '@/components/navigation/SearchBar'
import { Button } from '@/components/ui/Button'
import { PageContainer } from '@/components/layout/PageContainer'
import { Stage } from '@/components/media/Stage'
import { CATEGORIES } from '@/constants/navigation'

// Hero como escenario: la sala está a oscuras, se enciende el foco y
// aparece el texto, en ese orden.
export function HeroSection() {
  return (
    <Stage aria-labelledby="hero-title">
      <PageContainer className="relative flex min-h-[38rem] flex-col items-center justify-center py-20 text-center sm:min-h-[44rem]">
        <p className="enter text-xs font-semibold uppercase tracking-[0.3em] text-white/50" style={{ '--d': '600ms' }}>
          Mercado profesional de las artes escénicas
        </p>
        <h1 id="hero-title" className="enter mt-6 max-w-4xl font-display text-5xl font-bold leading-[0.98] tracking-tight sm:text-7xl lg:text-8xl" style={{ '--d': '800ms' }}>
          Todo lo que necesitás para <span className="stage-lit">hacer teatro.</span>
        </h1>
        <p className="enter mt-7 max-w-xl text-lg text-white/65" style={{ '--d': '1000ms' }}>
          Encontrá espacios, descubrí espectáculos, conectá con profesionales y accedé a recursos para tus proyectos.
        </p>
        <div className="enter mt-9 w-full max-w-2xl" style={{ '--d': '1200ms' }}>
          <SearchBar size="lg" className="border-white/10 shadow-[0_20px_60px_-20px_rgb(0_0_0_/_0.6)]" />
        </div>
        <nav aria-label="Accesos rápidos" className="enter mt-6 flex flex-wrap justify-center gap-2" style={{ '--d': '1350ms' }}>
          {CATEGORIES.map(({ id, label, to, icon: Icon }) => (
            <Link key={id} to={to}
              className="inline-flex min-h-10 items-center gap-2 rounded-full border border-white/15 px-4 text-sm font-semibold text-white/80 transition-colors hover:border-white/40 hover:bg-white/10 hover:text-white">
              <Icon aria-hidden className="size-4" />{label}
            </Link>
          ))}
        </nav>
        <div className="enter mt-10 flex flex-wrap justify-center gap-3" style={{ '--d': '1500ms' }}>
          <Button size="lg" to="/salas" iconRight={ArrowRight} className="bg-white !text-brand shadow-none hover:bg-[rgb(255_241_214)]">Ver salas</Button>
          <Button size="lg" variant="ghost" to="/publicar" className="text-white hover:bg-white/10">Publicar en TRAMA</Button>
        </div>
      </PageContainer>
    </Stage>
  )
}
