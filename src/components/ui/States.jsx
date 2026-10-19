import { SearchX, AlertTriangle, Lock, LogIn } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { cn } from '@/utils/format'
import { Button } from './Button'

export function EmptyState({ icon: Icon = SearchX, title, description, action, className }) {
  return (
    <div className={cn('flex flex-col items-center rounded-[var(--radius-card)] border border-dashed border-line-strong bg-surface/60 px-6 py-12 text-center', className)}>
      <Icon aria-hidden className="size-9 text-ink-soft" strokeWidth={1.5} />
      <h3 className="mt-3 font-display text-xl font-semibold">{title}</h3>
      {description && <p className="mt-1 max-w-md text-sm text-ink-soft">{description}</p>}
      {action && <div className="mt-5 flex flex-wrap justify-center gap-2">{action}</div>}
    </div>
  )
}

// Traduce un ServiceError a un mensaje y una salida clara.
export function ErrorState({ error, onRetry, className }) {
  const location = useLocation()
  if (error?.code === 'unauthenticated') {
    return (
      <EmptyState icon={LogIn} className={className} title="Iniciá sesión para continuar"
        description="Esta sección es para cuentas registradas."
        action={<Button to={`/ingresar?volver=${encodeURIComponent(location.pathname + location.search)}`}>Ingresar</Button>} />
    )
  }
  if (error?.code === 'forbidden') {
    return <EmptyState icon={Lock} className={className} title="No tenés acceso" description={error.message} action={<Button variant="secondary" to="/">Ir al inicio</Button>} />
  }
  if (error?.code === 'not_found') {
    return <EmptyState className={className} title="No encontramos esto" description={error.message} action={<Button variant="secondary" to="/">Ir al inicio</Button>} />
  }
  return (
    <EmptyState icon={AlertTriangle} className={className} title="Algo salió mal"
      description={error?.message ?? 'No pudimos cargar la información.'}
      action={onRetry && <Button variant="secondary" onClick={() => onRetry()}>Reintentar</Button>} />
  )
}

export function Skeleton({ className }) {
  return <div aria-hidden className={cn('animate-pulse rounded-md bg-ink/[0.07]', className)} />
}

export function LoadingSkeleton({ variant = 'cards', count = 6, label = 'Cargando…' }) {
  return (
    <div role="status" aria-label={label}>
      {variant === 'cards' && (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: count }, (_, i) => (
            <div key={i} className="overflow-hidden rounded-[var(--radius-card)] border border-line bg-surface">
              <Skeleton className="aspect-[4/3] rounded-none" />
              <div className="space-y-2 p-4"><Skeleton className="h-5 w-2/3" /><Skeleton className="h-4 w-1/2" /><Skeleton className="h-4 w-5/6" /></div>
            </div>
          ))}
        </div>
      )}
      {variant === 'detail' && (
        <div className="space-y-4"><Skeleton className="aspect-[21/9] w-full" /><Skeleton className="h-8 w-1/2" /><Skeleton className="h-4 w-2/3" /><Skeleton className="h-40 w-full" /></div>
      )}
      {variant === 'list' && (
        <div className="space-y-3">{Array.from({ length: count }, (_, i) => <Skeleton key={i} className="h-20 w-full" />)}</div>
      )}
      <span className="sr-only">{label}</span>
    </div>
  )
}
