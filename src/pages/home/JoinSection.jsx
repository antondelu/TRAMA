import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { PageContainer } from '@/components/layout/PageContainer'

// Cierre simple: un título y dos acciones.
export function JoinSection() {
  return (
    <section aria-labelledby="join-title" className="pb-16 pt-6 sm:pb-24">
      <PageContainer>
        <div className="relative overflow-hidden rounded-[2rem] bg-brand px-6 py-14 text-center text-white sm:py-20">
          <div aria-hidden className="drift pointer-events-none absolute -right-24 -top-24 size-80 rounded-full bg-accent/50 blur-3xl" />
          <div className="relative">
            <h2 id="join-title" className="font-display text-4xl font-bold tracking-tight sm:text-6xl">Formá parte de la red.</h2>
            <p className="mx-auto mt-3 max-w-md text-white/75">Publicar es gratis.</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button to="/publicar" size="lg" className="bg-white !text-brand hover:bg-white/90" iconRight={ArrowRight}>Publicar en TRAMA</Button>
              <Button to="/oportunidades" size="lg" variant="ghost" className="text-white hover:bg-white/10">Ver oportunidades</Button>
            </div>
          </div>
        </div>
      </PageContainer>
    </section>
  )
}
