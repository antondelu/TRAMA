import { useSearchParams } from 'react-router-dom'
import { Inbox } from 'lucide-react'
import { AccountHeader } from './AccountLayout'
import { Tabs } from '@/components/ui/Tabs'
import { EmptyState, ErrorState, LoadingSkeleton } from '@/components/ui/States'
import { DemoNotice } from '@/components/ui/DemoNotice'
import { RequestItem } from '@/features/inquiries/RequestItem'
import { requestsService } from '@/services'
import { useServiceQuery } from '@/hooks/useServiceQuery'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { REQUEST_KINDS, REQUEST_STATE_LABELS } from '@/utils/workflows'

const BOXES = [{ id: 'all', label: 'Todas' }, { id: 'received', label: 'Recibidas' }, { id: 'sent', label: 'Enviadas' }]

export default function RequestsPage() {
  useDocumentTitle('Solicitudes')
  const [params, setParams] = useSearchParams()
  const box = params.get('bandeja') ?? 'all'
  const kind = params.get('tipo') ?? ''
  const status = params.get('estado') ?? ''
  const { data, error, reload } = useServiceQuery(() => requestsService.list({ box, kind, status }), [box, kind, status])

  const set = (key, value) => setParams((p) => {
    const next = new URLSearchParams(p)
    if (value && value !== 'all') next.set(key, value)
    else next.delete(key)
    return next
  }, { replace: true })

  return (
    <>
      <AccountHeader title="Solicitudes y contrataciones" description="Reservas de sala, consultas de contratación y postulaciones. Cada tipo tiene sus propios estados." />
      <DemoNotice className="mb-5">Modo demo: ninguna solicitud es una reserva o contratación real.</DemoNotice>
      <Tabs label="Bandeja" tabs={BOXES} value={box} onChange={(v) => set('bandeja', v)} />
      <div className="mt-4 flex flex-wrap gap-3">
        <label className="text-sm">
          <span className="sr-only">Tipo de solicitud</span>
          <select value={kind} onChange={(e) => set('tipo', e.target.value)} className="min-h-10 rounded-lg border border-line-strong bg-surface px-3 text-sm">
            <option value="">Todos los tipos</option>
            {Object.entries(REQUEST_KINDS).map(([id, k]) => <option key={id} value={id}>{k.label}</option>)}
          </select>
        </label>
        <label className="text-sm">
          <span className="sr-only">Estado</span>
          <select value={status} onChange={(e) => set('estado', e.target.value)} className="min-h-10 rounded-lg border border-line-strong bg-surface px-3 text-sm">
            <option value="">Todos los estados</option>
            {Object.entries(REQUEST_STATE_LABELS).filter(([id]) => id !== 'received').map(([id, l]) => <option key={id} value={id}>{l}</option>)}
          </select>
        </label>
      </div>
      <div className="mt-5">
        {error ? <ErrorState error={error} onRetry={reload} /> : !data ? <LoadingSkeleton variant="list" count={3} />
          : data.length === 0 ? (
            <EmptyState icon={Inbox} title="No hay solicitudes acá" description="Cuando envíes o recibas una reserva, consulta o postulación, aparece en esta lista." />
          ) : <ul className="space-y-3">{data.map((r) => <RequestItem key={`${r.kind}-${r.id}`} request={r} />)}</ul>}
      </div>
    </>
  )
}
