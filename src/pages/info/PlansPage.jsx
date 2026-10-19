import { useState } from 'react'
import { PageHeader, PageContainer } from '@/components/layout/PageContainer'
import { Button } from '@/components/ui/Button'
import { DemoNotice } from '@/components/ui/DemoNotice'
import { ErrorState, LoadingSkeleton } from '@/components/ui/States'
import { PlanCard } from '@/features/memberships/PlanCard'
import { membershipsService } from '@/services'
import { useServiceQuery } from '@/hooks/useServiceQuery'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useAuth } from '@/context/AuthContext'
import { cn } from '@/utils/format'

export default function PlansPage() {
  useDocumentTitle('Planes')
  const { user } = useAuth()
  const [billing, setBilling] = useState('monthly')
  const query = useServiceQuery(() => membershipsService.listPlans(), [])
  const currentPlanId = user ? (user.plan?.id ?? 'plan-comunidad') : null

  const actionFor = (plan) => {
    if (!user) return <Button to="/registro" className="w-full" variant={plan.price ? 'primary' : 'secondary'}>{plan.price ? 'Registrarme y elegir' : 'Crear cuenta gratis'}</Button>
    if (plan.id === currentPlanId) return <Button to="/mi-cuenta/membresia" variant="secondary" className="w-full">Ver mi membresía</Button>
    return <Button to={`/mi-cuenta/membresia?plan=${plan.id}&periodo=${billing}`} className="w-full">Elegir {plan.name}</Button>
  }

  return (
    <>
      <PageHeader eyebrow="Membresías" title="Planes para crecer en el sector."
        description="Explorar y publicar en TRAMA es gratis. La membresía suma recursos exclusivos, formación y herramientas para profesionales."
        breadcrumbs={[{ label: 'Inicio', to: '/' }, { label: 'Planes' }]} />
      <PageContainer className="py-10">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div role="radiogroup" aria-label="Periodicidad" className="inline-flex rounded-lg border border-line bg-surface p-1">
            {[['monthly', 'Mensual'], ['yearly', 'Anual']].map(([id, label]) => (
              <button key={id} type="button" role="radio" aria-checked={billing === id} onClick={() => setBilling(id)}
                className={cn('min-h-10 rounded-md px-4 text-sm font-semibold', billing === id ? 'bg-brand text-white' : 'text-ink-soft hover:text-ink')}>{label}</button>
            ))}
          </div>
          <DemoNotice className="max-w-xl">Precios de demostración. Todavía no hay cobros: elegir un plan lo activa en modo demo, sin pago.</DemoNotice>
        </div>
        {query.error ? <ErrorState error={query.error} onRetry={query.reload} />
          : !query.data ? <LoadingSkeleton count={3} />
            : (
              <div className="grid gap-5 md:grid-cols-3">
                {query.data.map((plan) => (
                  <PlanCard key={plan.id} plan={plan} billing={billing} current={plan.id === currentPlanId}
                    highlighted={plan.id === 'plan-miembro'} action={actionFor(plan)} />
                ))}
              </div>
            )}
      </PageContainer>
    </>
  )
}
