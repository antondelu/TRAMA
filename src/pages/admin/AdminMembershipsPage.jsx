import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Pencil } from 'lucide-react'
import { AdminHeader } from './AdminLayout'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/StatusBadge'
import { Modal } from '@/components/ui/Modal'
import { DemoNotice } from '@/components/ui/DemoNotice'
import { ErrorState, LoadingSkeleton } from '@/components/ui/States'
import { FormField, Input, Textarea, Checkbox } from '@/components/forms/FormField'
import { FormError } from '@/components/forms/FormError'
import { fromLines, toLines } from '@/features/publishing/formHelpers'
import { membershipsService } from '@/services'
import { useServiceQuery } from '@/hooks/useServiceQuery'
import { useSubmit } from '@/features/inquiries/useSubmit'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { formatMoney } from '@/utils/format'

const schema = z.object({
  name: z.string().trim().min(2), description: z.string().trim().min(5),
  price: z.coerce.number().min(0, 'No puede ser negativo'), priceYearly: z.coerce.number().min(0, 'No puede ser negativo'),
  benefits: z.string(), limits: z.string(),
  accessMember: z.boolean(), accessPremium: z.boolean(), isActive: z.boolean(),
})

function PlanEditor({ plan, onClose }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: plan.name, description: plan.description, price: plan.price, priceYearly: plan.priceYearly, benefits: toLines(plan.benefits), limits: toLines(plan.limits),
      accessMember: plan.accessRules.includes('member'), accessPremium: plan.accessRules.includes('premium'), isActive: plan.isActive,
    },
  })
  const { run, submitting, error } = useSubmit({ successTitle: 'Plan actualizado', onSuccess: onClose })
  const onSubmit = (d) => run(() => membershipsService.savePlan({
    id: plan.id, name: d.name, description: d.description, price: d.price, priceYearly: d.priceYearly,
    billingPeriod: d.price ? 'monthly' : 'free', benefits: fromLines(d.benefits), limits: fromLines(d.limits), isActive: d.isActive,
    accessRules: ['public', ...(d.accessMember ? ['member'] : []), ...(d.accessPremium ? ['premium'] : [])],
  }))
  return (
    <Modal open onClose={onClose} title={`Editar plan ${plan.name}`} size="lg">
      <form noValidate className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-4 sm:grid-cols-3">
          <FormField label="Nombre" required error={errors.name?.message}><Input {...register('name')} /></FormField>
          <FormField label="Precio mensual (UYU)" required error={errors.price?.message}><Input type="number" min={0} {...register('price')} /></FormField>
          <FormField label="Precio anual (UYU)" required error={errors.priceYearly?.message}><Input type="number" min={0} {...register('priceYearly')} /></FormField>
        </div>
        <FormField label="Descripción" required error={errors.description?.message}><Input {...register('description')} /></FormField>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Beneficios" hint="Uno por línea"><Textarea rows={4} {...register('benefits')} /></FormField>
          <FormField label="Límites" hint="Uno por línea"><Textarea rows={4} {...register('limits')} /></FormField>
        </div>
        <fieldset className="space-y-2">
          <legend className="text-sm font-semibold">Acceso a contenidos</legend>
          <Checkbox label="Recursos para miembros" {...register('accessMember')} />
          <Checkbox label="Recursos del plan Profesional (cursos y clases)" {...register('accessPremium')} />
        </fieldset>
        <Checkbox label="Plan activo (visible en /planes)" {...register('isActive')} />
        <FormError error={error} />
        <div className="flex justify-end gap-2"><Button variant="secondary" onClick={onClose}>Cancelar</Button><Button type="submit" loading={submitting}>Guardar</Button></div>
      </form>
    </Modal>
  )
}

export default function AdminMembershipsPage() {
  useDocumentTitle('Membresías')
  const [editing, setEditing] = useState(null)
  const { data, error, reload } = useServiceQuery(() => membershipsService.listPlans({ includeInactive: true }), [])
  return (
    <>
      <AdminHeader title="Planes y membresías" description="Precios, periodicidad, beneficios, estado y acceso a contenidos." />
      <DemoNotice className="mb-6">Los precios son de demostración. Cambiar un plan no genera cobros ni modifica suscripciones reales.</DemoNotice>
      {error ? <ErrorState error={error} onRetry={reload} /> : !data ? <LoadingSkeleton variant="list" count={3} /> : (
        <ul className="grid gap-4 lg:grid-cols-3">
          {data.map((p) => (
            <li key={p.id} className="rounded-[var(--radius-card)] border border-line bg-surface p-5">
              <div className="flex items-center justify-between gap-2">
                <h2 className="font-display text-xl font-semibold">{p.name}</h2>
                <Badge tone={p.isActive ? 'success' : 'neutral'}>{p.isActive ? 'Activo' : 'Inactivo'}</Badge>
              </div>
              <p className="mt-1 text-sm text-ink-soft">{p.description}</p>
              <p className="mt-3 text-sm">{p.price ? `${formatMoney(p.price)} / mes · ${formatMoney(p.priceYearly)} / año` : 'Gratis'}</p>
              <p className="mt-2 text-xs text-ink-soft">Acceso: {p.accessRules.join(', ')}</p>
              <Button size="sm" variant="secondary" icon={Pencil} className="mt-4" onClick={() => setEditing(p)}>Editar</Button>
            </li>
          ))}
        </ul>
      )}
      {editing && <PlanEditor plan={editing} onClose={() => setEditing(null)} />}
    </>
  )
}
