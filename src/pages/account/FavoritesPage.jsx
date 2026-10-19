import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart, Trash2 } from 'lucide-react'
import { AccountHeader } from './AccountLayout'
import { Tabs } from '@/components/ui/Tabs'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/StatusBadge'
import { EmptyState, ErrorState, LoadingSkeleton } from '@/components/ui/States'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { favoritesService } from '@/services'
import { useServiceQuery } from '@/hooks/useServiceQuery'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useToast } from '@/context/ToastContext'
import { ENTITY_LABELS, ENTITY_ROUTES } from '@/constants/navigation'
import { formatShortDate } from '@/utils/format'

const TABS = [{ id: '', label: 'Todos' }, ...['venue', 'show', 'service', 'opportunity', 'resource'].map((id) => ({ id, label: ENTITY_LABELS[id] }))]

export default function FavoritesPage() {
  useDocumentTitle('Favoritos')
  const [type, setType] = useState('')
  const [removing, setRemoving] = useState(null)
  const [busy, setBusy] = useState(false)
  const { success, error: showError } = useToast()
  const { data, error, reload } = useServiceQuery(() => favoritesService.list(), [])
  const items = data?.filter((f) => !type || f.entityType === type)

  async function confirmRemove() {
    setBusy(true)
    try {
      await favoritesService.toggle(removing.entityType, removing.entityId)
      success('Quitado de favoritos', removing.title)
      setRemoving(null)
    } catch (e) {
      showError('No se pudo quitar', e.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <AccountHeader title="Favoritos" description="Todo lo que guardaste: salas, espectáculos, servicios, oportunidades y recursos." />
      <Tabs label="Tipo de favorito" tabs={TABS.map((t) => ({ ...t, count: data?.filter((f) => !t.id || f.entityType === t.id).length }))} value={type} onChange={setType} />
      <div className="mt-5">
        {error ? <ErrorState error={error} onRetry={reload} /> : !items ? <LoadingSkeleton variant="list" count={3} />
          : items.length === 0 ? (
            <EmptyState icon={Heart} title="No hay favoritos acá" description="Tocá el corazón en cualquier publicación para guardarla."
              action={<Button variant="secondary" to="/salas">Explorar TRAMA</Button>} />
          ) : (
            <ul className="divide-y divide-line rounded-[var(--radius-card)] border border-line bg-surface">
              {items.map((f) => (
                <li key={f.id} className="flex items-center gap-4 px-4 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-ink-soft">{ENTITY_LABELS[f.entityType]} · guardado el {formatShortDate(f.createdAt.slice(0, 10))}</p>
                    {f.available
                      ? <Link to={ENTITY_ROUTES[f.entityType](f.slug)} className="font-semibold hover:text-brand hover:underline">{f.title}</Link>
                      : <p className="font-semibold text-ink-soft">{f.title} <Badge>Ya no está publicado</Badge></p>}
                    <p className="truncate text-sm text-ink-soft">{f.subtitle}</p>
                  </div>
                  <Button variant="ghost" size="icon" aria-label={`Quitar ${f.title} de favoritos`} onClick={() => setRemoving(f)}><Trash2 aria-hidden className="size-4" /></Button>
                </li>
              ))}
            </ul>
          )}
      </div>
      <ConfirmDialog open={Boolean(removing)} title="¿Quitar de favoritos?" description={removing?.title} confirmLabel="Quitar" loading={busy}
        onConfirm={confirmRemove} onCancel={() => setRemoving(null)} />
    </>
  )
}
