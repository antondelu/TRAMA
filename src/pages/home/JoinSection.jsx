import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { PageContainer } from '@/components/layout/PageContainer'
import { Stage } from '@/components/media/Stage'

// Cierre: otro escenario con foco, para que la home abra y cierre como una función.
export function JoinSection() {
  return (
    <section aria-labelledby="join-title" className="pb-16 pt-6 sm:pb-24">
      <PageContainer>
        <Stage as="div" className="rounded-[2rem] px-6 py-16 text-center sm:py-24">
          <h2 id="join-title" className="font-display text-4xl font-bold tracking-tight sm:text-6xl">
            Formá parte <span className="stage-lit">de la red.</span>
          </h2>
          <p className="mx-auto mt-3 max-w-md text-white/65">Publicar es gratis.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button to="/publicar" size="lg" className="bg-white !text-brand shadow-none hover:bg-[rgb(255_241_214)]" iconRight={ArrowRight}>Publicar en TRAMA</Button>
            <Button to="/oportunidades" size="lg" variant="ghost" className="text-white hover:bg-white/10">Ver oportunidades</Button>
          </div>
        </Stage>
      </PageContainer>
    </section>
  )
}
