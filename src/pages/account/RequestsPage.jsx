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
import { REQUEST_KINDS, stateLabelFor } from '@/utils/workflows'

const BOXES = [{ id: 'all', label: 'Todas' }, { id: 'received', label: 'Te enviaron' }, { id: 'sent', label: 'Enviaste' }]

export default function RequestsPage() {
  useDocumentTitle('Solicitudes')
  const [params, setParams] = useSearchParams()
  const box = params.get('bandeja') ?? 'all'
  const kind = params.get('tipo') ?? ''
  const status = params.get('estado') ?? ''
  // El estado se filtra acá: así el selector ofrece solo los estados que hay en la lista.
  const { data: all, error, reload } = useServiceQuery(() => requestsService.list({ box, kind }), [box, kind])
  const statuses = [...new Map((all ?? []).map((r) => [r.status, stateLabelFor(r.status, box === 'received' ? 'receiver' : box === 'sent' ? 'sender' : r.side)]))]
  if (status && !statuses.some(([id]) => id === status)) statuses.push([status, stateLabelFor(status, 'sender')])
  const data = all && (status ? all.filter((r) => r.status === status) : all)

  const set = (key, value) => setParams((p) => {
    const next = new URLSearchParams(p)
    if (value && value !== 'all') next.set(key, value)
    else next.delete(key)
    return next
  }, { replace: true })

  return (
    <>
      <AccountHeader title="Solicitudes" description="Reservas, consultas, pedidos de contratación o presupuesto y postulaciones. Cada una tiene su conversación adentro." />
      <DemoNotice className="mb-5">Modo demo: ninguna solicitud es una reserva o contratación real.</DemoNotice>
      <Tabs label="Bandeja" tabs={BOXES} value={box} onChange={(v) => set('bandeja', v)} />
      <div className="mt-4 flex flex-wrap gap-3">
        <label className="text-sm">
          <span className="sr-only">Tipo de solicitud</span>
          <select value={kind} onChange={(e) => set('tipo', e.target.value)} className="min-h-10 rounded-lg border border-field bg-surface px-3 text-sm">
            <option value="">Todos los tipos</option>
            {Object.entries(REQUEST_KINDS).map(([id, k]) => <option key={id} value={id}>{k.label}</option>)}
          </select>
        </label>
        <label className="text-sm">
          <span className="sr-only">Estado</span>
          <select value={status} onChange={(e) => set('estado', e.target.value)} className="min-h-10 rounded-lg border border-field bg-surface px-3 text-sm">
            <option value="">Todos los estados</option>
            {statuses.map(([id, l]) => <option key={id} value={id}>{l}</option>)}
          </select>
        </label>
      </div>
      <div className="mt-5">
        {error ? <ErrorState error={error} onRetry={reload} /> : !data ? <LoadingSkeleton variant="list" count={3} />
          : data.length === 0 ? (
            <EmptyState icon={Inbox} title="No hay solicitudes acá" description={status || kind ? "Probá con otro tipo o estado." : "Cuando envíes o recibas una reserva, una consulta o una postulación, aparece acá con su conversación."} />
          ) : <ul className="space-y-3">{data.map((r) => <RequestItem key={`${r.kind}-${r.id}`} request={r} />)}</ul>}
      </div>
    </>
  )
}
