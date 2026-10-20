import { PageHeader, PageContainer } from '@/components/layout/PageContainer'
import { Accordion, AccordionItem } from '@/components/ui/Accordion'
import { Button } from '@/components/ui/Button'
import { Reveal } from '@/components/ui/Reveal'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { cn } from '@/utils/format'

const STEPS = [
  { n: '01', title: 'Creá tu cuenta', text: 'Es gratis. Elegí tus intereses para ver primero lo que más te sirve; igual tenés acceso a todo.' },
  { n: '02', title: 'Explorá y guardá', text: 'Buscá salas, obras, profesionales y convocatorias. Guardá en favoritos lo que te interese.' },
  { n: '03', title: 'Publicá', text: 'Sumá tu sala, tu espectáculo, tu servicio o una convocatoria. Cada publicación pasa por moderación antes de ser pública.' },
  { n: '04', title: 'Conectá', text: 'Enviá solicitudes de reserva, consultas de contratación o postulaciones. Todo queda registrado en tu cuenta.' },
]

const FAQ = [
  ['¿Alquilar una sala y postularme a su convocatoria es lo mismo?', 'No. Alquilar es pagar por usar el espacio en una fecha. Postularte a una convocatoria es pedirle a la sala que programe tu obra. En TRAMA son flujos distintos.'],
  ['¿Una solicitud de reserva ya es una reserva?', 'No. La sala tiene que aceptarla. Hasta entonces la fecha figura como "solicitud pendiente".'],
  ['¿Quién ve mis datos de contacto?', 'Nadie, salvo que los marques como públicos en tu perfil. Las consultas se hacen por mensajes dentro de TRAMA.'],
  ['¿Qué incluye la membresía?', 'Acceso a recursos exclusivos, alertas de convocatorias y, en el plan Profesional, cursos y clases grabadas.'],
  ['¿Por qué mi publicación no aparece?', 'Porque está en moderación. Te avisamos cuando se apruebe o si hace falta cambiar algo.'],
]

export default function HowItWorksPage() {
  useDocumentTitle('Cómo funciona')
  return (
    <>
      <PageHeader eyebrow="Cómo funciona" title="Un mercado hecho para el sector."
        description="TRAMA reúne la oferta y la demanda de las artes escénicas: espacios, obras, profesionales, convocatorias y conocimiento."
        breadcrumbs={[{ label: 'Inicio', to: '/' }, { label: 'Cómo funciona' }]} />
      <PageContainer className="py-12">
        {/* Un hilo une los números de los pasos: corre dentro de cada tarjeta y,
            en pantallas anchas, también por el espacio entre ellas. */}
        <ol className="relative grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <span aria-hidden className="absolute inset-x-6 top-[calc(2.625rem+1px)] hidden h-px bg-brand/20 lg:block" />
          {STEPS.map((s, i) => (
            <Reveal as="li" key={s.n} delay={i * 120} className="relative flex">
              <div className="group w-full rounded-[var(--radius-card)] border border-line bg-surface p-6 transition-colors hover:border-brand/40">
                <div className="flex items-center gap-3">
                  <span className="font-display text-3xl text-brand">{s.n}</span>
                  {/* En una columna el hilo se desvanece; en fila se une con la tarjeta siguiente. */}
                  <span aria-hidden className={cn('h-px flex-1 bg-gradient-to-r from-brand/25 to-transparent',
                    i < STEPS.length - 1 && 'lg:-mr-6 lg:bg-none lg:bg-brand/20 lg:transition-colors lg:group-hover:bg-brand/50')} />
                </div>
                <h2 className="mt-3 text-lg font-semibold">{s.title}</h2>
                <p className="mt-1 text-sm text-ink-soft">{s.text}</p>
              </div>
            </Reveal>
          ))}
        </ol>
        <h2 className="mb-4 mt-14 font-display text-3xl font-semibold">Preguntas frecuentes</h2>
        <Accordion>{FAQ.map(([q, a]) => <AccordionItem key={q} title={q}>{a}</AccordionItem>)}</Accordion>
        <div className="mt-10 flex flex-wrap gap-2"><Button to="/registro">Crear cuenta</Button><Button variant="secondary" to="/contacto">Hacer una consulta</Button></div>
      </PageContainer>
    </>
  )
}
