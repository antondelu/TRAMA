import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { DemoNotice } from '@/components/ui/DemoNotice'
import { FormField, Input, Textarea } from '@/components/forms/FormField'
import { FormError } from '@/components/forms/FormError'
import { requestsService } from '@/services'
import { useSubmit } from './useSubmit'
import { todayISO } from '@/utils/dates'

const schema = z.object({
  projectType: z.string().trim().min(3, 'Indicá el tipo de proyecto'),
  requestedDate: z.string().min(1, 'Indicá una fecha aproximada'),
  location: z.string().trim().min(2, 'Indicá la ubicación'),
  projectDescription: z.string().trim().min(20, 'Contá un poco más (mínimo 20 caracteres)').max(3000, 'Máximo 3000 caracteres'),
  budget: z.union([z.literal(''), z.coerce.number().min(0, 'No puede ser negativo')]).optional(),
})

// "Consultar servicio" y "Solicitar presupuesto" usan el mismo formulario.
export function ServiceInquiryModal({ open, onClose, pro, mode = 'inquiry' }) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema), defaultValues: { projectType: '', requestedDate: '', location: '', projectDescription: '', budget: '' },
  })
  const { run, submitting, error } = useSubmit({
    successTitle: mode === 'quote' ? 'Pedido de presupuesto enviado' : 'Consulta enviada', successText: 'Seguila en Mi cuenta › Solicitudes.',
    onSuccess: () => { reset(); onClose() },
  })
  return (
    <Modal open={open} onClose={onClose} title={mode === 'quote' ? `Solicitar presupuesto a ${pro.name}` : `Consultar a ${pro.name}`}>
      <form noValidate className="space-y-4" onSubmit={handleSubmit((data) => run(() => requestsService.createServiceInquiry({ serviceId: pro.id, ...data, budget: data.budget || null })))}>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Tipo de proyecto" required error={errors.projectType?.message}><Input placeholder="Ej. Diseño de luces para estreno" {...register('projectType')} /></FormField>
          <FormField label="Fecha aproximada" required error={errors.requestedDate?.message}><Input type="date" min={todayISO()} {...register('requestedDate')} /></FormField>
          <FormField label="Ubicación" required error={errors.location?.message}><Input placeholder="Ciudad o sala" {...register('location')} /></FormField>
          <FormField label="Presupuesto orientativo (UYU)" hint="Opcional" error={errors.budget?.message}><Input type="number" min={0} {...register('budget')} /></FormField>
        </div>
        <FormField label="Descripción del proyecto" required error={errors.projectDescription?.message}><Textarea rows={5} {...register('projectDescription')} /></FormField>
        <FormError error={error} />
        <DemoNotice>Modo demo: no es una contratación real.</DemoNotice>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="submit" loading={submitting}>Enviar</Button>
        </div>
      </form>
    </Modal>
  )
}
