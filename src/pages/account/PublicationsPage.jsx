import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Eye, Pencil, PauseCircle, Trash2, Send, FileStack, Plus } from 'lucide-react'
import { AccountHeader } from './AccountLayout'
import { Button } from '@/components/ui/Button'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Tabs } from '@/components/ui/Tabs'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { EmptyState, ErrorState, LoadingSkeleton } from '@/components/ui/States'
import { profilesService } from '@/services'
import { useServiceQuery } from '@/hooks/useServiceQuery'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useToast } from '@/context/ToastContext'
import { ENTITY_ROUTES } from '@/constants/navigation'
import { canTransitionPublication } from '@/utils/workflows'
import { formatShortDate } from '@/utils/format'

const EDIT_ROUTES = { venue: 'sala', show: 'espectaculo', service: 'servicio', opportunity: 'convocatoria' }
const TABS = [{ id: '', label: 'Todas' }, { id: 'venue', label: 'Salas' }, { id: 'show', label: 'Espectáculos' }, { id: 'service', label: 'Servicios' }, { id: 'opportunity', label: 'Convocatorias' }]

export default function PublicationsPage() {
  useDocumentTitle('Mis publicaciones')
  const [type, setType] = useState('')
  const [confirm, setConfirm] = useState(null) // { action, item }
  const [busy, setBusy] = useState(false)
  const { success, error: showError } = useToast()
  const { data, error, reload } = useServiceQuery(() => profilesService.listMyPublications(), [])
  const items = data?.filter((p) => !type || p.type === type)

  async function run() {
    const { action, item } = confirm
    setBusy(true)
    try {
      if (action === 'delete') await profilesService.deletePublication(item.type, item.id)
      else await profilesService.setPublicationStatus(item.type, item.id, action)
      success(action === 'delete' ? 'Publicación eliminada' : action === 'inactive' ? 'Publicación desactivada' : 'Enviada a moderación', item.title)
      setConfirm(null)
    } catch (e) {
      showError('No se pudo completar la acción', e.message)
    } finally {
      setBusy(false)
    }
  }

  const texts = {
    delete: ['¿Eliminar esta publicación?', 'Deja de aparecer en TRAMA y en los favoritos de otras personas. No se puede deshacer.', 'Eliminar'],
    inactive: ['¿Desactivar esta publicación?', 'Deja de ser pública. Podés volver a enviarla a moderación cuando quieras.', 'Desactivar'],
    pending: ['¿Enviar a moderación?', 'El equipo de TRAMA la revisa antes de publicarla.', 'Enviar'],
  }

  return (
    <>
      <AccountHeader title="Mis publicaciones" description="Salas, espectáculos, servicios y convocatorias que publicaste."
        actions={<Button icon={Plus} to="/publicar">Nueva publicación</Button>} />
      <Tabs label="Tipo" tabs={TABS.map((t) => ({ ...t, count: data?.filter((p) => !t.id || p.type === t.id).length }))} value={type} onChange={setType} />
      <div className="mt-5">
        {error ? <ErrorState error={error} onRetry={reload} /> : !items ? <LoadingSkeleton variant="list" count={3} />
          : items.length === 0 ? <EmptyState icon={FileStack} title="Todavía no publicaste nada acá" action={<Button to="/publicar">Publicar</Button>} />
            : (
              <div className="overflow-x-auto rounded-[var(--radius-card)] border border-line bg-surface">
                <table className="w-full min-w-[44rem] text-sm">
                  <thead className="border-b border-line bg-canvas text-left text-xs uppercase tracking-wide text-ink-soft">
                    <tr><th className="px-4 py-3">Publicación</th><th className="px-4 py-3">Estado</th><th className="px-4 py-3">Creada</th><th className="px-4 py-3">Actualizada</th><th className="px-4 py-3 text-right">Acciones</th></tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {items.map((p) => (
                      <tr key={`${p.type}-${p.id}`}>
                        <td className="px-4 py-3">
                          <span className="block text-xs text-ink-soft">{p.typeLabel}</span>
                          <span className="font-semibold">{p.title}</span>
                          {p.moderationNote && ['rejected', 'changes_requested'].includes(p.status) && <span className="block text-xs text-danger">Moderación: {p.moderationNote}</span>}
                        </td>
                        <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                        <td className="px-4 py-3 text-ink-soft">{formatShortDate(p.createdAt.slice(0, 10))}</td>
                        <td className="px-4 py-3 text-ink-soft">{formatShortDate(p.updatedAt.slice(0, 10))}</td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-1">
                            <Link to={ENTITY_ROUTES[p.type](p.slug)} className="rounded-lg p-2 hover:bg-ink/5" title="Ver" aria-label={`Ver ${p.title}`}><Eye aria-hidden className="size-4" /></Link>
                            <Link to={`/publicar/${EDIT_ROUTES[p.type]}?id=${p.id}`} className="rounded-lg p-2 hover:bg-ink/5" title="Editar" aria-label={`Editar ${p.title}`}><Pencil aria-hidden className="size-4" /></Link>
                            {canTransitionPublication(p.storedStatus, 'pending', 'owner') && (
                              <button type="button" onClick={() => setConfirm({ action: 'pending', item: p })} className="rounded-lg p-2 hover:bg-ink/5" title="Enviar a moderación" aria-label={`Enviar ${p.title} a moderación`}><Send aria-hidden className="size-4" /></button>
                            )}
                            {canTransitionPublication(p.storedStatus, 'inactive', 'owner') && (
                              <button type="button" onClick={() => setConfirm({ action: 'inactive', item: p })} className="rounded-lg p-2 hover:bg-ink/5" title="Desactivar" aria-label={`Desactivar ${p.title}`}><PauseCircle aria-hidden className="size-4" /></button>
                            )}
                            <button type="button" onClick={() => setConfirm({ action: 'delete', item: p })} className="rounded-lg p-2 text-danger hover:bg-danger-soft" title="Eliminar" aria-label={`Eliminar ${p.title}`}><Trash2 aria-hidden className="size-4" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
      </div>
      <ConfirmDialog open={Boolean(confirm)} title={texts[confirm?.action]?.[0]} description={confirm && `${confirm.item.title}. ${texts[confirm.action][1]}`}
        confirmLabel={texts[confirm?.action]?.[2]} tone={confirm?.action === 'pending' ? 'primary' : 'danger'} loading={busy} onConfirm={run} onCancel={() => setConfirm(null)} />
    </>
  )
}
