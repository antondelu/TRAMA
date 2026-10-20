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

const schema = z.object({
  organization: z.string().trim().min(2, 'Indicá la organización'),
  venueName: z.string().trim().min(2, 'Indicá la sala o el festival'),
  requestedDates: z.string().trim().min(3, 'Indicá fechas estimadas'),
  functionCount: z.coerce.number({ invalid_type_error: 'Indicá un número' }).int().min(1, 'Al menos 1 función').max(100, 'Máximo 100'),
  message: z.string().trim().min(10, 'Escribí al menos 10 caracteres').max(3000, 'Máximo 3000 caracteres'),
})

// Consulta de contratación ("Pedir contratación" / "Hacer una consulta").
export function ShowInquiryModal({ open, onClose, show, mode = 'inquiry' }) {
  const { register, handleSubmit, reset, getValues, trigger, formState: { errors } } = useForm({
    resolver: zodResolver(schema), defaultValues: { organization: '', venueName: '', requestedDates: '', functionCount: 1, message: '' },
  })
  const { run, submitting, error } = useSubmit({
    successTitle: 'Consulta guardada', successText: 'Seguila en Mi cuenta › Solicitudes.',
    onSuccess: () => { reset(); onClose() },
  })
  const title = mode === 'proposal' ? `Pedir contratación de ${show.title}` : `Consulta sobre ${show.title}`

  async function saveDraft() {
    if (!(await trigger(['organization']))) return
    run(() => requestsService.createShowInquiry({ showId: show.id, ...getValues(), asDraft: true }))
  }

  return (
    <Modal open={open} onClose={onClose} title={title} description="La compañía responde desde TRAMA. La respuesta te llega a Mi cuenta › Solicitudes.">
      <form noValidate className="space-y-4" onSubmit={handleSubmit((data) => run(() => requestsService.createShowInquiry({ showId: show.id, ...data })))}>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Organización" required error={errors.organization?.message}><Input {...register('organization')} /></FormField>
          <FormField label="Sala o festival" required error={errors.venueName?.message}><Input {...register('venueName')} /></FormField>
          <FormField label="Fechas estimadas" required hint="Ej. 12 al 14 de febrero" error={errors.requestedDates?.message}><Input {...register('requestedDates')} /></FormField>
          <FormField label="Cantidad de funciones" required error={errors.functionCount?.message}><Input type="number" min={1} {...register('functionCount')} /></FormField>
        </div>
        <FormField label={mode === 'proposal' ? 'Tu propuesta' : 'Tu consulta'} required error={errors.message?.message}><Textarea rows={5} {...register('message')} /></FormField>
        <FormError error={error} />
        <DemoNotice>Modo demo: no es una contratación real.</DemoNotice>
        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="ghost" onClick={saveDraft} disabled={submitting}>Guardar borrador</Button>
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="submit" loading={submitting}>Enviar</Button>
        </div>
      </form>
    </Modal>
  )
}
