import { ArrowRight } from 'lucide-react'
import { PageContainer } from '@/components/layout/PageContainer'
import { Button } from '@/components/ui/Button'

// Cierre: un plano azul noche con la invitación a publicar.
export function JoinSection() {
  return (
    <section aria-labelledby="join-title" className="bg-brand-strong text-white">
      <PageContainer className="grid gap-8 py-16 sm:py-24 lg:grid-cols-[minmax(0,1.4fr)_auto] lg:items-end">
        <div>
          <h2 id="join-title" className="font-display text-5xl font-extrabold leading-[0.92] sm:text-7xl">
            Formá parte <span className="block text-area-convocatorias [font-stretch:72%]">de la red.</span>
          </h2>
          <p className="mt-4 text-lg text-white/80">Publicar es gratis.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button to="/publicar" size="lg" variant="inverse" iconRight={ArrowRight}>Publicar en TRAMA</Button>
          <Button to="/oportunidades" size="lg" variant="inverse-outline">Ver convocatorias</Button>
        </div>
      </PageContainer>
    </section>
  )
}
