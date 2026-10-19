import { useState } from 'react'
import { CalendarClock } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { FormField, Input, Textarea } from '@/components/forms/FormField'
import { FormError } from '@/components/forms/FormError'
import { requestsService } from '@/services'
import { useToast } from '@/context/ToastContext'
import { TRANSITION_LABELS, stateLabelFor } from '@/utils/workflows'
import { todayISO } from '@/utils/dates'
import { formatDate } from '@/utils/format'

// Acciones permitidas para una solicitud, según su tipo, estado y de qué
// lado está la persona. Las que cierran el proceso piden confirmación.
const NEEDS_CONFIRM = ['rejected', 'cancelled', 'withdrawn', 'accepted']
const DANGER = ['rejected', 'cancelled', 'withdrawn']

export function RequestActions({ request: r }) {
  const { success } = useToast()
  const [pending, setPending] = useState(null) // { to, note }
  const [proposeOpen, setProposeOpen] = useState(false)
  const [proposedDate, setProposedDate] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  async function apply(to, extra = {}) {
    setBusy(true)
    setError(null)
    try {
      await requestsService.transition(r.kind, r.id, to, extra)
      success(`Solicitud: ${stateLabelFor(to, r.side === 'sender' ? 'receiver' : 'sender')}`, r.entityTitle)
      setPending(null)
      setProposeOpen(false)
    } catch (e) {
      setError(e)
    } finally {
      setBusy(false)
    }
  }

  async function propose() {
    setBusy(true)
    setError(null)
    try {
      await requestsService.proposeDate(r.id, proposedDate)
      success('Propusiste otra fecha', formatDate(proposedDate))
      setProposeOpen(false)
      setProposedDate('')
    } catch (e) {
      setError(e)
    } finally {
      setBusy(false)
    }
  }

  async function acceptProposal() {
    setBusy(true)
    setError(null)
    try {
      await requestsService.acceptProposedDate(r.id)
      success('Aceptaste la fecha propuesta', 'La sala todavía tiene que confirmar la reserva.')
    } catch (e) {
      setError(e)
    } finally {
      setBusy(false)
    }
  }

  const canPropose = r.kind === 'booking' && r.side === 'receiver' && ['sent', 'in_conversation'].includes(r.status)
  if (!r.actions.length && !canPropose && !r.canAcceptProposal) return null

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {r.canAcceptProposal && <Button size="sm" variant="accent" loading={busy} onClick={acceptProposal}>Aceptar fecha propuesta ({formatDate(r.proposedDate)})</Button>}
        {r.actions.map((to) => (
          <Button key={to} size="sm" variant={DANGER.includes(to) ? 'secondary' : to === 'accepted' ? 'primary' : 'secondary'}
            onClick={() => (NEEDS_CONFIRM.includes(to) ? setPending({ to, note: '' }) : apply(to))} disabled={busy}>
            {TRANSITION_LABELS[to]}
          </Button>
        ))}
        {canPropose && <Button size="sm" variant="ghost" icon={CalendarClock} onClick={() => setProposeOpen(true)}>Proponer otra fecha</Button>}
      </div>
      {!pending && !proposeOpen && <FormError error={error} />}

      <ConfirmDialog open={Boolean(pending)} tone={DANGER.includes(pending?.to) ? 'danger' : 'primary'} loading={busy}
        title={`¿${TRANSITION_LABELS[pending?.to] ?? ''}?`}
        description={pending?.to === 'accepted' && r.kind === 'booking'
          ? 'Antes de aceptar se vuelve a comprobar que la fecha siga libre en tu calendario.'
          : 'Esta acción se registra en el historial de la solicitud.'}
        confirmLabel={TRANSITION_LABELS[pending?.to]} onCancel={() => { setPending(null); setError(null) }}
        onConfirm={() => apply(pending.to, { note: pending.note.trim() || null })}>
        <FormField label="Mensaje (opcional)">
          <Textarea rows={3} value={pending?.note ?? ''} onChange={(e) => setPending((p) => ({ ...p, note: e.target.value }))} />
        </FormField>
        <div className="mt-3"><FormError error={error} /></div>
      </ConfirmDialog>

      <Modal open={proposeOpen} onClose={() => setProposeOpen(false)} title="Proponer otra fecha" size="sm"
        description="La persona que pidió la reserva puede aceptarla. Después vos confirmás.">
        <form noValidate className="space-y-4" onSubmit={(e) => { e.preventDefault(); if (proposedDate) propose() }}>
          <FormField label="Nueva fecha" required>
            <Input type="date" min={todayISO()} value={proposedDate} onChange={(e) => setProposedDate(e.target.value)} />
          </FormField>
          <FormError error={error} />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setProposeOpen(false)}>Cancelar</Button>
            <Button type="submit" loading={busy} disabled={!proposedDate}>Proponer</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
