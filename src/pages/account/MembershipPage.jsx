import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AccountHeader } from './AccountLayout'
import { Button } from '@/components/ui/Button'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { DemoNotice } from '@/components/ui/DemoNotice'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { ErrorState, LoadingSkeleton } from '@/components/ui/States'
import { PlanCard } from '@/features/memberships/PlanCard'
import { membershipsService } from '@/services'
import { useServiceQuery } from '@/hooks/useServiceQuery'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useToast } from '@/context/ToastContext'
import { formatDate, formatMoney } from '@/utils/format'
import { INTEGRATIONS } from '@/config/integrations'

const STATUS = { active: 'Activa', expired: 'Vencida', cancelled: 'Cancelada' }

export default function MembershipPage() {
  useDocumentTitle('Membresía')
  const [params] = useSearchParams()
  const { success, error: showError } = useToast()
  const mine = useServiceQuery(() => membershipsService.getMine(), [])
  const plans = useServiceQuery(() => membershipsService.listPlans(), [])
  const [choice, setChoice] = useState(() => (params.get('plan') ? { planId: params.get('plan'), billing: params.get('periodo') === 'yearly' ? 'yearly' : 'monthly' } : null))
  const [cancelOpen, setCancelOpen] = useState(false)
  const [busy, setBusy] = useState(false)

  const query = mine.error ? mine : plans
  if (query.error) return <ErrorState error={query.error} onRetry={query.reload} />
  if (!mine.data || !plans.data) return <LoadingSkeleton variant="list" count={2} />
  const { membership, plan, history } = mine.data
  const chosenPlan = plans.data.find((p) => p.id === choice?.planId)

  async function activate() {
    setBusy(true)
    try {
      await membershipsService.activateDemo(choice.planId, choice.billing)
      success(chosenPlan.price ? `Plan ${chosenPlan.name} activado en modo demo` : 'Volviste al plan Comunidad', 'No se realizó ningún cobro.')
      setChoice(null)
    } catch (e) {
      showError('No se pudo cambiar el plan', e.message)
    } finally {
      setBusy(false)
    }
  }

  async function cancel() {
    setBusy(true)
    try {
      await membershipsService.cancel()
      success('Membresía cancelada')
      setCancelOpen(false)
    } catch (e) {
      showError('No se pudo cancelar', e.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <AccountHeader title="Membresía" description="Tu plan actual, sus beneficios y el historial." />
      <DemoNotice className="mb-6">Sin pagos reales: activar un plan solo cambia datos de esta demo. {INTEGRATIONS.payments.note}</DemoNotice>
      <div className="mb-8 rounded-[var(--radius-card)] border border-line bg-surface p-5">
        <p className="text-sm text-ink-soft">Plan actual</p>
        <p className="mt-1 font-serif text-2xl font-semibold">{plan?.name ?? 'Comunidad'}</p>
        {membership ? (
          <p className="mt-1 text-sm">
            {membership.billing === 'yearly' ? 'Anual' : 'Mensual'} · activo desde el {formatDate(membership.startAt.slice(0, 10))} hasta el {formatDate(membership.endAt.slice(0, 10))}
            {membership.demo && ' · activado en modo demo, sin cobro'}
          </p>
        ) : <p className="mt-1 text-sm text-ink-soft">Gratis, sin vencimiento.</p>}
        {membership && <Button variant="secondary" size="sm" className="mt-4" onClick={() => setCancelOpen(true)}>Cancelar membresía</Button>}
      </div>

      <h2 className="mb-4 font-serif text-2xl font-semibold">Cambiar de plan</h2>
      <div className="grid gap-5 lg:grid-cols-3">
        {plans.data.map((p) => (
          <PlanCard key={p.id} plan={p} billing={choice?.planId === p.id ? choice.billing : 'monthly'} current={(plan?.id ?? 'plan-comunidad') === p.id}
            action={(plan?.id ?? 'plan-comunidad') !== p.id && (
              <div className="grid gap-2">
                <Button onClick={() => setChoice({ planId: p.id, billing: 'monthly' })}>{p.price ? 'Elegir mensual' : 'Pasar a Comunidad'}</Button>
                {p.priceYearly > 0 && <Button variant="secondary" onClick={() => setChoice({ planId: p.id, billing: 'yearly' })}>Elegir anual</Button>}
              </div>
            )} />
        ))}
      </div>

      {history.length > 0 && (
        <>
          <h2 className="mb-3 mt-10 font-semibold">Historial</h2>
          <ul className="divide-y divide-line rounded-[var(--radius-card)] border border-line bg-surface text-sm">
            {history.map((m) => (
              <li key={m.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
                <span>{plans.data.find((p) => p.id === m.planId)?.name ?? m.planId} · {formatDate(m.startAt.slice(0, 10))} – {formatDate(m.endAt.slice(0, 10))}</span>
                <StatusBadge status={m.status === 'active' ? 'published' : m.status === 'expired' ? 'expired' : 'cancelled'} label={STATUS[m.status]} />
              </li>
            ))}
          </ul>
        </>
      )}

      <ConfirmDialog open={Boolean(choice && chosenPlan)} tone="primary" loading={busy} onCancel={() => setChoice(null)} onConfirm={activate}
        title={chosenPlan ? `Activar plan ${chosenPlan.name}` : ''} confirmLabel="Activar en modo demo"
        description={chosenPlan?.price ? `${formatMoney(choice?.billing === 'yearly' ? chosenPlan.priceYearly : chosenPlan.price)} por ${choice?.billing === 'yearly' ? 'año' : 'mes'} (precio de demostración). No se te va a cobrar nada.` : 'Tu membresía paga actual se cancela.'} />
      <ConfirmDialog open={cancelOpen} title="¿Cancelar la membresía?" description="Perdés el acceso a los recursos exclusivos." confirmLabel="Cancelar membresía" cancelLabel="Volver"
        loading={busy} onConfirm={cancel} onCancel={() => setCancelOpen(false)} />
    </>
  )
}
