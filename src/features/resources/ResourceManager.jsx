import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Pencil, Send, Archive, CalendarClock, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { StatusBadge, AccessBadge } from '@/components/ui/StatusBadge'
import { Tabs } from '@/components/ui/Tabs'
import { Modal } from '@/components/ui/Modal'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { FormField, Input } from '@/components/forms/FormField'
import { EmptyState, ErrorState, LoadingSkeleton } from '@/components/ui/States'
import { ResourceEditor } from './ResourceEditor'
import { resourcesService } from '@/services'
import { useServiceQuery } from '@/hooks/useServiceQuery'
import { useToast } from '@/context/ToastContext'
import { formatShortDate } from '@/utils/format'

const TABS = [{ id: '', label: 'Todos' }, { id: 'draft', label: 'Borradores' }, { id: 'published', label: 'Publicados' }, { id: 'archived', label: 'Archivados' }]

// Gestión editorial: crear, editar, publicar (o programar) y archivar.
export function ResourceManager() {
  const [status, setStatus] = useState('')
  const [editing, setEditing] = useState(null) // null | 'new' | resource
  const [scheduling, setScheduling] = useState(null)
  const [scheduleDate, setScheduleDate] = useState('')
  const [archiving, setArchiving] = useState(null)
  const { success, error: showError } = useToast()
  const { data, error, reload } = useServiceQuery(() => resourcesService.listAll(), [])
  const items = data?.filter((r) => !status || r.publicationStatus === status)

  async function setResourceStatus(r, to, publishAt) {
    try {
      await resourcesService.setStatus(r.id, to, { publishAt })
      success(to === 'published' ? (publishAt ? 'Publicación programada' : 'Recurso publicado') : to === 'archived' ? 'Recurso archivado' : 'Vuelto a borrador', r.title)
    } catch (e) {
      showError('No se pudo cambiar el estado', e.message)
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tabs label="Estado" tabs={TABS.map((t) => ({ ...t, count: data?.filter((r) => !t.id || r.publicationStatus === t.id).length }))} value={status} onChange={setStatus} />
        <Button icon={Plus} onClick={() => setEditing('new')}>Nuevo recurso</Button>
      </div>
      {error ? <ErrorState error={error} onRetry={reload} /> : !items ? <LoadingSkeleton variant="list" count={4} />
        : items.length === 0 ? <EmptyState title="No hay recursos en este estado" />
          : (
            <ul className="divide-y divide-line rounded-[var(--radius-card)] border border-line bg-surface">
              {items.map((r) => {
                const scheduled = r.publicationStatus === 'published' && r.publishedAt > new Date().toISOString()
                return (
                  <li key={r.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
                    <div className="min-w-0 flex-1">
                      <Link to={`/recursos/${r.slug}`} className="font-semibold hover:text-brand hover:underline">{r.title}</Link>
                      <p className="text-xs text-ink-soft">{r.author} · actualizado {formatShortDate(r.updatedAt.slice(0, 10))}{scheduled && ` · se publica el ${formatShortDate(r.publishedAt.slice(0, 10))}`}</p>
                    </div>
                    <AccessBadge accessLevel={r.accessLevel} />
                    <StatusBadge status={scheduled ? 'pending' : r.publicationStatus} label={scheduled ? 'Programado' : undefined} />
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" aria-label={`Editar ${r.title}`} onClick={() => setEditing(r)}><Pencil aria-hidden className="size-4" /></Button>
                      {r.publicationStatus !== 'published' && (
                        <>
                          <Button variant="ghost" size="icon" aria-label={`Publicar ${r.title}`} title="Publicar ahora" onClick={() => setResourceStatus(r, 'published')}><Send aria-hidden className="size-4" /></Button>
                          <Button variant="ghost" size="icon" aria-label={`Programar ${r.title}`} title="Programar" onClick={() => setScheduling(r)}><CalendarClock aria-hidden className="size-4" /></Button>
                        </>
                      )}
                      {r.publicationStatus === 'archived'
                        ? <Button variant="ghost" size="icon" aria-label={`Volver a borrador ${r.title}`} title="Volver a borrador" onClick={() => setResourceStatus(r, 'draft')}><RotateCcw aria-hidden className="size-4" /></Button>
                        : <Button variant="ghost" size="icon" aria-label={`Archivar ${r.title}`} title="Archivar" onClick={() => setArchiving(r)}><Archive aria-hidden className="size-4" /></Button>}
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
      <ResourceEditor open={Boolean(editing)} resource={editing === 'new' ? null : editing} onClose={() => setEditing(null)} />
      <Modal open={Boolean(scheduling)} onClose={() => setScheduling(null)} size="sm" title="Programar publicación" description={scheduling?.title}>
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setResourceStatus(scheduling, 'published', `${scheduleDate}T09:00:00-03:00`); setScheduling(null) }}>
          <FormField label="Fecha de publicación" required><Input type="date" required min={new Date().toISOString().slice(0, 10)} value={scheduleDate} onChange={(e) => setScheduleDate(e.target.value)} /></FormField>
          <p className="text-xs text-ink-soft">En la demo, el recurso aparece cuando llega la fecha. En producción esto lo tiene que manejar el servidor.</p>
          <div className="flex justify-end gap-2"><Button variant="secondary" onClick={() => setScheduling(null)}>Cancelar</Button><Button type="submit" disabled={!scheduleDate}>Programar</Button></div>
        </form>
      </Modal>
      <ConfirmDialog open={Boolean(archiving)} title="¿Archivar este recurso?" description={`${archiving?.title}. Deja de estar disponible en la biblioteca.`} confirmLabel="Archivar"
        onCancel={() => setArchiving(null)} onConfirm={async () => { await setResourceStatus(archiving, 'archived'); setArchiving(null) }} />
    </div>
  )
}
