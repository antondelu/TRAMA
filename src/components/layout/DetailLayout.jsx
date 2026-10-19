import { Eye } from 'lucide-react'
import { PageContainer, Breadcrumbs } from './PageContainer'
import { ErrorState, LoadingSkeleton } from '@/components/ui/States'

// Esqueleto de las páginas de detalle: contenido a la izquierda y un panel
// de acciones fijo a la derecha (abajo en móvil).
export function DetailLayout({ breadcrumbs, hero, children, aside, isPreview }) {
  return (
    <PageContainer className="py-6 sm:py-10">
      <Breadcrumbs items={breadcrumbs} />
      {isPreview && (
        <p role="status" className="mb-4 flex items-center gap-2 rounded-lg border border-warning/25 bg-warning-soft px-3 py-2 text-sm text-warning">
          <Eye aria-hidden className="size-4" />
          Vista previa: esta publicación todavía no es pública. Solo la ven vos y el equipo de moderación.
        </p>
      )}
      {hero}
      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_22rem]">
        <div className="min-w-0 space-y-12">{children}</div>
        {/* En móvil las acciones van arriba del contenido para no tener que bajar todo. */}
        <aside className="order-first lg:order-none lg:sticky lg:top-24 lg:self-start">{aside}</aside>
      </div>
    </PageContainer>
  )
}

export function DetailState({ query }) {
  if (query.error) return <PageContainer className="py-16"><ErrorState error={query.error} onRetry={query.reload} /></PageContainer>
  return <PageContainer className="py-10"><LoadingSkeleton variant="detail" /></PageContainer>
}

export function ActionPanel({ title, children }) {
  return (
    <div className="space-y-4 rounded-[var(--radius-card)] border border-line bg-surface p-5 shadow-[var(--shadow-card)]">
      {title && <h2 className="font-display text-xl font-semibold">{title}</h2>}
      {children}
    </div>
  )
}
