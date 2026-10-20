import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AdminHeader } from './AdminLayout'
import { Button } from '@/components/ui/Button'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { EmptyState, ErrorState, LoadingSkeleton } from '@/components/ui/States'
import { inputClasses } from '@/components/forms/FormField'
import { adminService } from '@/services'
import { useServiceQuery } from '@/hooks/useServiceQuery'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useToast } from '@/context/ToastContext'
import { OPPORTUNITY_STATES } from '@/utils/workflows'
import { formatDate } from '@/utils/format'

export default function AdminOpportunitiesPage() {
  useDocumentTitle('Convocatorias')
  const { success, error: showError } = useToast()
  const [status, setStatus] = useState('')
  const [closing, setClosing] = useState(null)
  const { data, error, reload } = useServiceQuery(() => adminService.listOpportunities({ status }), [status])

  async function close() {
    try {
      await adminService.closeOpportunity(closing.id)
      success('Convocatoria cerrada', closing.title)
    } catch (e) {
      showError('No se pudo cerrar', e.message)
    }
    setClosing(null)
  }

  return (
    <>
      <AdminHeader title="Convocatorias" description="Todas las convocatorias, con su estado real. Las vencidas se calculan por fecha."
        actions={(
          <label><span className="sr-only">Estado</span>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className={inputClasses(false)}>
              <option value="">Todos los estados</option>
              {Object.entries(OPPORTUNITY_STATES).map(([id, l]) => <option key={id} value={id}>{l}</option>)}
            </select>
          </label>
        )} />
      <p className="mb-4 text-sm text-ink-soft">Para aprobar o rechazar convocatorias nuevas, usá <Link to="/admin/publicaciones" className="font-semibold text-brand hover:underline">Moderación</Link>.</p>
      {error ? <ErrorState error={error} onRetry={reload} /> : !data ? <LoadingSkeleton variant="list" count={4} />
        : data.length === 0 ? <EmptyState title="No hay convocatorias en ese estado" />
          : (
            <div className="overflow-x-auto rounded-[var(--radius-card)] border border-line bg-surface">
              <table className="w-full min-w-[44rem] text-sm">
                <thead className="border-b border-line bg-canvas text-left text-xs uppercase tracking-wide text-ink-soft">
                  <tr><th className="px-4 py-3">Convocatoria</th><th className="px-4 py-3">Fecha límite</th><th className="px-4 py-3">Origen</th><th className="px-4 py-3">Estado</th><th className="px-4 py-3 text-right">Acciones</th></tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {data.map((o) => (
                    <tr key={o.id}>
                      <td className="px-4 py-3"><Link to={`/oportunidades/${o.slug}`} className="font-semibold hover:text-brand hover:underline">{o.title}</Link><span className="block text-xs text-ink-soft">{o.organizationName}</span></td>
                      <td className="px-4 py-3">{formatDate(o.deadline)}</td>
                      <td className="px-4 py-3 text-xs">{o.originVerified ? 'Verificado' : 'Sin verificar'}</td>
                      <td className="px-4 py-3"><StatusBadge status={o.publicState} /></td>
                      <td className="px-4 py-3 text-right">{o.status === 'published' && <Button size="sm" variant="secondary" onClick={() => setClosing(o)}>Cerrar</Button>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
      <ConfirmDialog open={Boolean(closing)} title="¿Cerrar esta convocatoria?" description={closing && `${closing.title}. Deja de recibir postulaciones.`}
        confirmLabel="Cerrar convocatoria" onCancel={() => setClosing(null)} onConfirm={close} />
    </>
  )
}
