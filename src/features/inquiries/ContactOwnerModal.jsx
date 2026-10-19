import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { FormField, Textarea } from '@/components/forms/FormField'
import { FormError } from '@/components/forms/FormError'
import { messagesService } from '@/services'
import { useSubmit } from './useSubmit'

const schema = z.object({ body: z.string().trim().min(10, 'Escribí al menos 10 caracteres').max(4000, 'Máximo 4000 caracteres') })

// "Enviar consulta": abre una conversación con quien publicó, dentro de TRAMA.
// Los datos de contacto de la persona no se exponen.
export function ContactOwnerModal({ open, onClose, entityType, entityId, ownerId, subject }) {
  const navigate = useNavigate()
  const { register, handleSubmit, reset, formState: { errors } } = useForm({ resolver: zodResolver(schema), defaultValues: { body: '' } })
  const { run, submitting, error } = useSubmit({
    successTitle: 'Consulta enviada',
    onSuccess: (conversationId) => { reset(); onClose(); navigate(`/mi-cuenta/mensajes?c=${conversationId}`) },
  })
  return (
    <Modal open={open} onClose={onClose} title="Enviar consulta" description={`Sobre: ${subject}. La respuesta te llega a Mensajes.`}>
      <form noValidate className="space-y-4" onSubmit={handleSubmit(({ body }) => run(() => messagesService.startWithOwner({ entityType, entityId, ownerId, subject, body })))}>
        <FormField label="Tu consulta" required error={errors.body?.message}>
          <Textarea rows={5} placeholder="Hola, quería consultar…" {...register('body')} />
        </FormField>
        <FormError error={error} />
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="submit" loading={submitting}>Enviar</Button>
        </div>
      </form>
    </Modal>
  )
}
