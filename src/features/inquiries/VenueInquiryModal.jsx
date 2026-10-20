import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { FormField, Textarea } from '@/components/forms/FormField'
import { FormError } from '@/components/forms/FormError'
import { requestsService } from '@/services'
import { useSubmit } from './useSubmit'

const schema = z.object({ message: z.string().trim().min(10, 'Escribí al menos 10 caracteres').max(4000, 'Máximo 4000 caracteres') })

// "Hacer una consulta" a una sala: es una solicitud más, con su conversación
// en Mi cuenta › Solicitudes (igual que las consultas a espectáculos y servicios).
// Los datos de contacto de la sala no se exponen.
export function VenueInquiryModal({ open, onClose, venue }) {
  const navigate = useNavigate()
  const { register, handleSubmit, reset, formState: { errors } } = useForm({ resolver: zodResolver(schema), defaultValues: { message: '' } })
  const { run, submitting, error } = useSubmit({
    successTitle: 'Consulta enviada', successText: 'La respuesta te llega a Mi cuenta › Solicitudes.',
    onSuccess: () => { reset(); onClose(); navigate('/mi-cuenta/solicitudes?bandeja=sent') },
  })
  return (
    <Modal open={open} onClose={onClose} title={`Consulta a ${venue.name}`} description="La sala responde desde TRAMA. La respuesta te llega a Mi cuenta › Solicitudes.">
      <form noValidate className="space-y-4" onSubmit={handleSubmit(({ message }) => run(() => requestsService.createVenueInquiry({ venueId: venue.id, message })))}>
        <FormField label="Tu consulta" required error={errors.message?.message}>
          <Textarea rows={5} placeholder="Hola, quería consultar…" {...register('message')} />
        </FormField>
        <FormError error={error} />
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="submit" loading={submitting}>Enviar consulta</Button>
        </div>
      </form>
    </Modal>
  )
}
