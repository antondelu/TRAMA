import { Check } from 'lucide-react'
import { Badge } from '@/components/ui/StatusBadge'
import { formatMoney, cn } from '@/utils/format'

const ACCESS_TEXT = { public: 'Recursos gratuitos', member: 'Recursos para miembros', premium: 'Cursos y clases (Profesional)' }

export function PlanCard({ plan, billing, current, action, highlighted }) {
  const price = billing === 'yearly' ? plan.priceYearly : plan.price
  return (
    <article className={cn('flex flex-col rounded-[var(--radius-card)] border bg-surface p-6 shadow-[var(--shadow-card)]', highlighted ? 'border-brand ring-1 ring-brand' : 'border-line')}>
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-display text-2xl font-semibold">{plan.name}</h3>
        {current && <Badge tone="accent">Tu plan</Badge>}
        {!plan.isActive && <Badge>Inactivo</Badge>}
      </div>
      <p className="mt-1 text-sm text-ink-soft">{plan.description}</p>
      <p className="mt-5">
        <span className="font-display text-4xl font-semibold">{price === 0 ? 'Gratis' : formatMoney(price, plan.currency)}</span>
        {price > 0 && <span className="text-sm text-ink-soft"> / {billing === 'yearly' ? 'año' : 'mes'}</span>}
      </p>
      {plan.demoPrice && price > 0 && <p className="mt-1 text-xs text-warning">Precio de demostración, no definitivo.</p>}
      <ul className="mt-5 flex-1 space-y-2 text-sm">
        {plan.benefits.map((b) => <li key={b} className="flex gap-2"><Check aria-hidden className="mt-0.5 size-4 shrink-0 text-accent" />{b}</li>)}
        {plan.limits.map((l) => <li key={l} className="flex gap-2 text-ink-soft"><span aria-hidden className="w-4 text-center">·</span>{l}</li>)}
      </ul>
      <p className="mt-4 border-t border-line pt-3 text-xs text-ink-soft">Acceso: {plan.accessRules.map((a) => ACCESS_TEXT[a]).join(', ')}.</p>
      {action && <div className="mt-5">{action}</div>}
    </article>
  )
}
