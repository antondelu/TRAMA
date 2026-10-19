import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { DemoNotice } from '@/components/ui/DemoNotice'
import { FormField, Input, Select, Textarea } from '@/components/forms/FormField'
import { FormError } from '@/components/forms/FormError'
import { requestsService } from '@/services'
import { useTaxonomies } from '@/hooks/useTaxonomies'
import { useSubmit } from '@/features/inquiries/useSubmit'
import { todayISO } from '@/utils/dates'

const schema = z.object({
  date: z.string().min(1, 'Elegí una fecha').refine((d) => d >= todayISO(), 'La fecha tiene que ser futura'),
  timeSlot: z.string().min(1, 'Elegí una franja horaria'),
  activityType: z.string().min(1, 'Elegí el tipo de actividad'),
  functionCount: z.coerce.number({ invalid_type_error: 'Indicá un número' }).int('Tiene que ser un número entero').min(0, 'No puede ser negativo').max(60, 'Máximo 60'),
  message: z.string().max(2000, 'Máximo 2000 caracteres').optional(),
})

// Solicitud de reserva: queda "Enviada" hasta que la sala responda.
// Nunca se confirma sola.
export function BookingRequestModal({ open, onClose, venue, initialDate }) {
  const { tax } = useTaxonomies()
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { date: initialDate ?? '', timeSlot: '', activityType: '', functionCount: 1, message: '' },
  })
  useEffect(() => { if (open) reset((v) => ({ ...v, date: initialDate ?? v.date })) }, [open, initialDate, reset])
  const { run, submitting, error } = useSubmit({
    successTitle: 'Solicitud enviada', successText: 'La sala tiene que responder. Podés seguirla en Mi cuenta › Solicitudes.',
    onSuccess: () => { reset(); onClose() },
  })

  return (
    <Modal open={open} onClose={onClose} title={`Solicitar reserva en ${venue.name}`}
      description="La sala recibe tu pedido y responde desde TRAMA. Hasta que lo acepte, no es una reserva confirmada.">
      <form id="booking-form" noValidate className="space-y-4" onSubmit={handleSubmit((data) => run(() => requestsService.createBooking({ venueId: venue.id, ...data })))}>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Fecha" required error={errors.date?.message}><Input type="date" min={todayISO()} {...register('date')} /></FormField>
          <FormField label="Horario o franja" required error={errors.timeSlot?.message}><Select placeholder="Elegí una opción" options={tax.timeSlots} {...register('timeSlot')} /></FormField>
          <FormField label="Tipo de actividad" required error={errors.activityType?.message}><Select placeholder="Elegí una opción" options={tax.activityTypes} {...register('activityType')} /></FormField>
          <FormField label="Cantidad estimada de funciones" required hint="Poné 0 si es un ensayo o una grabación." error={errors.functionCount?.message}>
            <Input type="number" min={0} inputMode="numeric" {...register('functionCount')} />
          </FormField>
        </div>
        <FormField label="Mensaje para la sala" hint="Opcional. Contá qué querés hacer y qué necesitás." error={errors.message?.message}>
          <Textarea {...register('message')} />
        </FormField>
        <FormError error={error} />
        <DemoNotice>Modo demo: la solicitud se guarda solo en esta pestaña y no es una reserva real.</DemoNotice>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="submit" loading={submitting}>Enviar solicitud</Button>
        </div>
      </form>
    </Modal>
  )
}
