import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Check, X, PencilLine, Archive, ShieldCheck } from 'lucide-react'
import { AdminHeader } from './AdminLayout'
import { Button } from '@/components/ui/Button'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Tabs } from '@/components/ui/Tabs'
import { Modal } from '@/components/ui/Modal'
import { FormField, Textarea, inputClasses } from '@/components/forms/FormField'
import { FormError } from '@/components/forms/FormError'
import { EmptyState, ErrorState, LoadingSkeleton } from '@/components/ui/States'
import { adminService } from '@/services'
import { useServiceQuery } from '@/hooks/useServiceQuery'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useToast } from '@/context/ToastContext'
import { ENTITY_ROUTES } from '@/constants/navigation'
import { canTransitionPublication, PUBLICATION_ACTION_LABELS, PUBLICATION_STATES } from '@/utils/workflows'
import { formatShortDate } from '@/utils/format'

const ACTIONS = [
  { to: 'published', icon: Check, variant: 'primary' },
  { to: 'changes_requested', icon: PencilLine, variant: 'secondary', needsNote: true },
  { to: 'rejected', icon: X, variant: 'secondary', needsNote: true },
  { to: 'archived', icon: Archive, variant: 'ghost' },
]

export default function AdminModerationPage() {
  useDocumentTitle('Moderación')
  const { success } = useToast()
  const [type, setType] = useState('')
  const [status, setStatus] = useState('pending')
  const [acting, setActing] = useState(null) // { item, action }
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const { data, error: loadError, reload } = useServiceQuery(() => adminService.moderationQueue({ type, status }), [type, status])

  async function confirm() {
    setBusy(true)
    setError(null)
    try {
      await adminService.moderate(acting.item.type, acting.item.id, acting.action.to, note)
      success(`${PUBLICATION_ACTION_LABELS[acting.action.to]}: hecho`, acting.item.title)
      setActing(null)
      setNote('')
    } catch (e) {
      setError(e)
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <AdminHeader title="Moderación" description="Revisá salas, espectáculos, servicios y convocatorias antes de que sean públicas." />
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Tabs label="Tipo" value={type} onChange={setType} tabs={[{ id: '', label: 'Todo' }, { id: 'venue', label: 'Salas' }, { id: 'show', label: 'Espectáculos' }, { id: 'service', label: 'Servicios' }, { id: 'opportunity', label: 'Convocatorias' }]} />
        <label className="ml-auto"><span className="sr-only">Estado</span>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className={inputClasses(false)}>
            <option value="">Todos los estados</option>
            {Object.entries(PUBLICATION_STATES).map(([id, l]) => <option key={id} value={id}>{l}</option>)}
          </select>
        </label>
      </div>
      {loadError ? <ErrorState error={loadError} onRetry={reload} /> : !data ? <LoadingSkeleton variant="list" count={3} />
        : data.length === 0 ? <EmptyState icon={ShieldCheck} title="No hay nada para revisar" description="La cola está al día." />
          : (
            <ul className="space-y-3">
              {data.map((item) => (
                <li key={`${item.type}-${item.id}`} className="rounded-[var(--radius-card)] border border-line bg-surface p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs text-ink-soft">{item.typeLabel} · {item.ownerName} · {formatShortDate(item.updatedAt.slice(0, 10))}</p>
                      <Link to={ENTITY_ROUTES[item.type](item.slug)} className="font-semibold hover:text-brand hover:underline">{item.title}</Link>
                      <p className="mt-1 line-clamp-2 text-sm text-ink-soft">{item.description}</p>
                      {item.moderationNote && <p className="mt-1 text-xs text-ink-soft">Nota anterior: {item.moderationNote}</p>}
                    </div>
                    <StatusBadge status={item.status} />
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {ACTIONS.filter((a) => canTransitionPublication(item.status, a.to, 'moderator')).map((a) => (
                      <Button key={a.to} size="sm" variant={a.variant} icon={a.icon} onClick={() => { setActing({ item, action: a }); setNote(''); setError(null) }}>
                        {PUBLICATION_ACTION_LABELS[a.to]}
                      </Button>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          )}
      <Modal open={Boolean(acting)} onClose={() => setActing(null)} size="sm" title={acting ? `${PUBLICATION_ACTION_LABELS[acting.action.to]}: ${acting.item.title}` : ''}
        description={acting?.action.needsNote ? 'El motivo le llega a quien publicó.' : 'Quien publicó recibe una notificación.'}
        footer={<><Button variant="secondary" onClick={() => setActing(null)}>Cancelar</Button><Button loading={busy} onClick={confirm}>{acting && PUBLICATION_ACTION_LABELS[acting.action.to]}</Button></>}>
        <FormField label={acting?.action.needsNote ? 'Motivo' : 'Nota (opcional)'} required={acting?.action.needsNote}>
          <Textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} />
        </FormField>
        <div className="mt-3"><FormError error={error} /></div>
      </Modal>
    </>
  )
}
