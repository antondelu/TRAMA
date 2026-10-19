import { PageHeader, PageContainer } from '@/components/layout/PageContainer'
import { Button } from '@/components/ui/Button'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

export default function AboutPage() {
  useDocumentTitle('Nosotros')
  return (
    <>
      <PageHeader eyebrow="Nosotros" title="Hilos que sostienen la escena."
        breadcrumbs={[{ label: 'Inicio', to: '/' }, { label: 'Nosotros' }]} />
      <PageContainer narrow className="space-y-6 py-12 text-lg leading-relaxed">
        <p>
          Una trama es el conjunto de hilos que se cruzan para formar un tejido. Así funciona el teatro: salas, compañías, técnicos,
          diseñadoras, productores y programadores que se necesitan para que una función suceda.
        </p>
        <p className="text-ink-soft">
          TRAMA nace para que esos hilos se encuentren más fácil. Un mercado profesional donde las salas muestran sus espacios,
          las obras encuentran dónde presentarse, los profesionales consiguen proyectos y todo el sector accede a conocimiento útil.
        </p>
        <p className="text-ink-soft">
          Empezamos por Uruguay, con la idea de crecer a la región. Esta es una versión de demostración: los contenidos son ficticios
          y sirven para mostrar cómo va a funcionar la plataforma.
        </p>
        <div className="flex flex-wrap gap-2 pt-4"><Button to="/como-funciona">Cómo funciona</Button><Button variant="secondary" to="/contacto">Escribinos</Button></div>
      </PageContainer>
    </>
  )
}
