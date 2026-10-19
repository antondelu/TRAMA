import { PageHeader, PageContainer } from '@/components/layout/PageContainer'
import { Button } from '@/components/ui/Button'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

export default function AboutPage() {
  useDocumentTitle('Nosotros')
  return (
    <>
      <PageHeader eyebrow="Nosotros" title="Hilos que sostienen la escena."
        breadcrumbs={[{ label: 'Inicio', to: '/' }, { label: 'Nosotros' }]} />
      <PageContainer className="py-12">
        <div className="mx-auto grid max-w-5xl gap-10 md:grid-cols-[18rem_minmax(0,1fr)] md:items-start lg:gap-14">
          <div className="space-y-6 text-lg leading-relaxed">
            <p>
              En el teatro, la trama conecta personajes, acciones y conflictos para construir una historia. TRAMA lleva esa idea a quienes
              hacen posible cada función: salas, compañías, artistas, técnicos, diseñadores, productores y programadores. Un espacio para
              conectar sus trabajos y dar lugar a nuevos proyectos.
            </p>
            <p className="text-ink-soft">
              TRAMA nace para que esos hilos se encuentren más fácil. Un mercado profesional donde las salas muestran sus espacios,
              las obras encuentran dónde presentarse, los profesionales consiguen proyectos y todo el sector accede a conocimiento útil.
            </p>
            <p className="text-ink-soft">
              Empezamos por Uruguay, con la idea de crecer a la región.
            </p>
            <div className="flex flex-wrap gap-2 pt-4"><Button to="/como-funciona">Cómo funciona</Button><Button variant="secondary" to="/contacto">Escribinos</Button></div>
          </div>
          <figure className="mx-auto w-full max-w-xs md:order-first md:mx-0">
            <img src="/team/marco-de-luca.jpg" alt="Marco De Luca" width="1206" height="1603" loading="lazy"
              className="aspect-[3/4] w-full rounded-2xl object-cover shadow-[var(--shadow-card)]" />
            <figcaption className="mt-3 text-sm text-ink-soft">
              <span className="block font-semibold text-ink">Marco De Luca</span>
              Actor, director y productor teatral
            </figcaption>
          </figure>
        </div>
      </PageContainer>
    </>
  )
}
