import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { SearchBar } from '@/components/navigation/SearchBar'
import { Button } from '@/components/ui/Button'
import { PageContainer } from '@/components/layout/PageContainer'
import { CATEGORIES } from '@/constants/navigation'

export function HeroSection() {
  return (
    <section aria-labelledby="hero-title" className="relative overflow-hidden border-b border-line bg-surface">
      {/* Hilos de la trama, como textura de fondo */}
      <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{ backgroundImage: 'repeating-linear-gradient(0deg, var(--color-brand) 0 1px, transparent 1px 28px), repeating-linear-gradient(90deg, var(--color-accent) 0 1px, transparent 1px 28px)' }} />
      <PageContainer className="relative py-16 sm:py-24">
        <p className="eyebrow text-brand">Mercado profesional de las artes escénicas</p>
        <h1 id="hero-title" className="mt-4 max-w-4xl font-serif text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
          Todo lo que necesitás para <em className="text-brand">hacer teatro.</em>
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-ink-soft sm:text-xl">
          Encontrá espacios, descubrí espectáculos, conectá con profesionales y accedé a recursos para desarrollar tus proyectos.
        </p>
        <SearchBar size="lg" className="mt-8 max-w-3xl" />
        <nav aria-label="Accesos rápidos" className="mt-5 flex flex-wrap gap-2">
          {CATEGORIES.map(({ id, label, to, icon: Icon }) => (
            <Link key={id} to={to} className="inline-flex min-h-10 items-center gap-2 rounded-full border border-line-strong bg-canvas px-4 text-sm font-semibold hover:border-brand hover:text-brand">
              <Icon aria-hidden className="size-4" />{label}
            </Link>
          ))}
        </nav>
        <div className="mt-10 flex flex-wrap gap-3">
          <Button size="lg" to="/salas" iconRight={ArrowRight}>Explorar TRAMA</Button>
          <Button size="lg" variant="secondary" to="/publicar">Publicar en TRAMA</Button>
        </div>
      </PageContainer>
    </section>
  )
}
