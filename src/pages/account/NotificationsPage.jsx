import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, CheckCheck, Inbox, MessageSquare, RefreshCw, CalendarClock, BadgeCheck, Shield } from 'lucide-react'
import { AccountHeader } from './AccountLayout'
import { Button } from '@/components/ui/Button'
import { Tabs } from '@/components/ui/Tabs'
import { EmptyState, ErrorState, LoadingSkeleton } from '@/components/ui/States'
import { notificationsService, NOTIFICATION_TYPES } from '@/services'
import { useServiceQuery } from '@/hooks/useServiceQuery'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { cn, formatShortDate } from '@/utils/format'

const ICONS = { new_request: Inbox, request_response: RefreshCw, status_change: RefreshCw, opportunity_closing: CalendarClock, new_message: MessageSquare, membership: BadgeCheck, admin_notice: Shield }

export default function NotificationsPage() {
  useDocumentTitle('Notificaciones')
  const navigate = useNavigate()
  const [filter, setFilter] = useState('all')
  const { data, error, reload } = useServiceQuery(() => notificationsService.list(), [])
  const items = data?.filter((n) => filter === 'all' || !n.readAt)
  const unread = data?.filter((n) => !n.readAt).length ?? 0

  async function open(n) {
    if (!n.readAt) await notificationsService.markRead(n.id)
    if (n.targetUrl) navigate(n.targetUrl)
  }

  return (
    <>
      <AccountHeader title="Notificaciones" description="Avisos de solicitudes, mensajes, convocatorias y membresía."
        actions={<Button variant="secondary" icon={CheckCheck} disabled={!unread} onClick={() => notificationsService.markAllRead()}>Marcar todas como leídas</Button>} />
      <Tabs label="Filtrar notificaciones" value={filter} onChange={setFilter} tabs={[{ id: 'all', label: 'Todas', count: data?.length }, { id: 'unread', label: 'Sin leer', count: unread }]} />
      <div className="mt-5">
        {error ? <ErrorState error={error} onRetry={reload} /> : !items ? <LoadingSkeleton variant="list" count={4} />
          : items.length === 0 ? <EmptyState icon={Bell} title={filter === 'unread' ? 'Estás al día' : 'No tenés notificaciones'} />
            : (
              <ul className="divide-y divide-line rounded-[var(--radius-card)] border border-line bg-surface">
                {items.map((n) => {
                  const Icon = ICONS[n.type] ?? Bell
                  return (
                    <li key={n.id} className={cn('flex items-start gap-3 px-4 py-3', !n.readAt && 'bg-brand-soft/40')}>
                      <Icon aria-hidden className="mt-0.5 size-5 shrink-0 text-ink-soft" />
                      <button type="button" onClick={() => open(n)} className="min-w-0 flex-1 text-left">
                        <span className="block text-xs text-ink-soft">{NOTIFICATION_TYPES[n.type]} · {formatShortDate(n.createdAt.slice(0, 10))}</span>
                        <span className={cn('block text-sm', !n.readAt ? 'font-bold' : 'font-semibold')}>{n.title}{!n.readAt && <span className="sr-only"> (sin leer)</span>}</span>
                        <span className="block text-sm text-ink-soft">{n.body}</span>
                      </button>
                      {!n.readAt && <Button variant="ghost" size="sm" onClick={() => notificationsService.markRead(n.id)}>Marcar leída</Button>}
                    </li>
                  )
                })}
              </ul>
            )}
      </div>
    </>
  )
}
