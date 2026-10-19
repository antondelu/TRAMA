import { Link } from 'react-router-dom'
import { Building2, Drama, Wrench, Megaphone, ArrowRight } from 'lucide-react'
import { PageHeader, PageContainer } from '@/components/layout/PageContainer'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

const OPTIONS = [
  { to: '/publicar/sala', icon: Building2, title: 'Sala', text: 'Un espacio para alquilar: ficha técnica, condiciones y calendario.' },
  { to: '/publicar/espectaculo', icon: Drama, title: 'Espectáculo', text: 'Una obra disponible para programar, girar o coproducir.' },
  { to: '/publicar/servicio', icon: Wrench, title: 'Servicio', text: 'Tu perfil profesional o el de tu empresa en el directorio.' },
  { to: '/publicar/convocatoria', icon: Megaphone, title: 'Convocatoria', text: 'Una oportunidad: programación, festival, residencia o búsqueda.' },
]

export default function PublishChooserPage() {
  useDocumentTitle('Publicar')
  return (
    <>
      <PageHeader eyebrow="Publicar" title="¿Qué querés publicar?"
        description="Podés tener varias publicaciones de distintos tipos con la misma cuenta. Todas pasan por moderación antes de ser públicas."
        breadcrumbs={[{ label: 'Inicio', to: '/' }, { label: 'Publicar' }]} />
      <PageContainer className="py-10">
        <ul className="grid gap-4 sm:grid-cols-2">
          {OPTIONS.map(({ to, icon: Icon, title, text }) => (
            <li key={to}>
              <Link to={to} className="group flex h-full items-start gap-4 rounded-[var(--radius-card)] border border-line bg-surface p-6 shadow-[var(--shadow-card)] hover:border-brand">
                <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand"><Icon aria-hidden className="size-6" /></span>
                <span>
                  <span className="flex items-center gap-1 font-display text-2xl font-semibold">{title}<ArrowRight aria-hidden className="size-5 transition-transform group-hover:translate-x-0.5" /></span>
                  <span className="mt-1 block text-sm text-ink-soft">{text}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </PageContainer>
    </>
  )
}
