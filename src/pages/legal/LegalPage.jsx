import { PageHeader, PageContainer } from '@/components/layout/PageContainer'
import { DemoNotice } from '@/components/ui/DemoNotice'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

// Plantilla para textos legales. El contenido real lo tiene que redactar o
// revisar un profesional del derecho antes de publicar la plataforma.
export function LegalPage({ title, updated, sections }) {
  useDocumentTitle(title)
  return (
    <>
      <PageHeader eyebrow="Legal" title={title} description={`Última actualización: ${updated}`}
        breadcrumbs={[{ label: 'Inicio', to: '/' }, { label: title }]} />
      <PageContainer narrow className="space-y-8 py-10">
        <DemoNotice>Texto provisorio de la versión de demostración. Debe revisarse legalmente antes del lanzamiento.</DemoNotice>
        {sections.map((s) => (
          <section key={s.title}>
            <h2 className="font-serif text-2xl font-semibold">{s.title}</h2>
            <div className="mt-2 space-y-3 leading-relaxed text-ink-soft">{s.body.map((p) => <p key={p}>{p}</p>)}</div>
          </section>
        ))}
      </PageContainer>
    </>
  )
}
