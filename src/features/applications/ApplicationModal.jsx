import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { DemoNotice } from '@/components/ui/DemoNotice'
import { FormField, Select, Textarea } from '@/components/forms/FormField'
import { FormError } from '@/components/forms/FormError'
import { requestsService, showsService } from '@/services'
import { useServiceQuery } from '@/hooks/useServiceQuery'
import { useSubmit } from '@/features/inquiries/useSubmit'

// Las convocatorias de programación piden un espectáculo; las de
// profesionales o colaboración, solo la propuesta.
const NEEDS_SHOW = ['programacion', 'temporada', 'festival', 'seleccion']

export function ApplicationModal({ open, onClose, opportunity }) {
  const needsShow = NEEDS_SHOW.includes(opportunity.opportunityType)
  const { data: myShows = [] } = useServiceQuery(() => showsService.listMine({ publishedOnly: true }), [], { enabled: open && needsShow })
  const schema = z.object({
    showId: needsShow ? z.string().min(1, 'Elegí el espectáculo que postulás') : z.string().optional(),
    proposal: z.string().trim().min(30, 'Contá tu propuesta (mínimo 30 caracteres)').max(4000, 'Máximo 4000 caracteres'),
  })
  const { register, handleSubmit, reset, formState: { errors } } = useForm({ resolver: zodResolver(schema), defaultValues: { showId: '', proposal: '' } })
  const { run, submitting, error } = useSubmit({
    successTitle: 'Postulación enviada', successText: 'La organización la va a revisar. Seguila en Solicitudes.',
    onSuccess: () => { reset(); onClose() },
  })

  return (
    <Modal open={open} onClose={onClose} title="Postularme" description={opportunity.title}>
      <form noValidate className="space-y-4" onSubmit={handleSubmit((data) => run(() => requestsService.apply({ opportunityId: opportunity.id, ...data })))}>
        {needsShow && (
          myShows.length ? (
            <FormField label="Espectáculo" required error={errors.showId?.message}>
              <Select placeholder="Elegí uno de tus espectáculos" options={myShows.map((s) => ({ id: s.id, label: s.title }))} {...register('showId')} />
            </FormField>
          ) : (
            <p className="rounded-lg bg-warning-soft px-3 py-2 text-sm text-warning">
              Esta convocatoria pide un espectáculo publicado en TRAMA y todavía no tenés ninguno. Podés publicarlo desde Publicar › Espectáculo.
            </p>
          )
        )}
        <FormField label="Propuesta" required hint={`Documentación solicitada: ${opportunity.documents.join(', ') || 'no se indica'}.`} error={errors.proposal?.message}>
          <Textarea rows={6} {...register('proposal')} />
        </FormField>
        <FormError error={error} />
        <DemoNotice>Modo demo: los adjuntos todavía no se pueden subir. La postulación se guarda solo en esta pestaña.</DemoNotice>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="submit" loading={submitting} disabled={needsShow && !myShows.length}>Enviar postulación</Button>
        </div>
      </form>
    </Modal>
  )
}
