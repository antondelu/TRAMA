import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { MessageSquare, ArrowLeft, Send } from 'lucide-react'
import { AccountHeader } from './AccountLayout'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { DemoNotice } from '@/components/ui/DemoNotice'
import { EmptyState, ErrorState, LoadingSkeleton } from '@/components/ui/States'
import { FormError } from '@/components/forms/FormError'
import { messagesService } from '@/services'
import { useServiceQuery } from '@/hooks/useServiceQuery'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { cn, formatShortDate } from '@/utils/format'

const time = (iso) => new Date(iso).toLocaleTimeString('es-UY', { hour: '2-digit', minute: '2-digit' })

function Conversation({ id, onBack }) {
  const { data, error, reload } = useServiceQuery(() => messagesService.getConversation(id), [id])
  const [body, setBody] = useState('')
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState(null)
  const endRef = useRef(null)
  useEffect(() => { endRef.current?.scrollIntoView?.({ block: 'end' }) }, [data?.messages.length])

  async function onSubmit(e) {
    e.preventDefault()
    if (!body.trim() || sending) return
    setSending(true)
    setSendError(null)
    try {
      await messagesService.send(id, body)
      setBody('')
    } catch (err) {
      setSendError(err)
    } finally {
      setSending(false)
    }
  }

  if (error) return <ErrorState error={error} onRetry={reload} />
  if (!data) return <LoadingSkeleton variant="list" count={3} />
  return (
    <section aria-label={`Conversación con ${data.participants.join(', ')}`} className="flex h-full flex-col">
      <header className="flex items-center gap-3 border-b border-line p-4">
        <Button variant="ghost" size="icon" className="md:hidden" onClick={onBack} aria-label="Volver a las conversaciones"><ArrowLeft aria-hidden className="size-5" /></Button>
        <div className="min-w-0">
          <h2 className="truncate font-semibold">{data.participants.join(', ')}</h2>
          <p className="truncate text-xs text-ink-soft">{data.subject}</p>
        </div>
      </header>
      <ol className="flex-1 space-y-3 overflow-y-auto p-4" aria-live="polite">
        {data.messages.map((m) => (
          <li key={m.id} className={cn('flex', m.mine ? 'justify-end' : 'justify-start')}>
            <div className={cn('max-w-[85%] rounded-2xl px-4 py-2.5 text-sm', m.mine ? 'rounded-br-md bg-brand text-white' : 'rounded-bl-md bg-canvas')}>
              {!m.mine && <p className="mb-0.5 text-xs font-semibold">{m.senderName}</p>}
              <p className="whitespace-pre-wrap">{m.body}</p>
              <p className={cn('mt-1 text-[11px]', m.mine ? 'text-white/70' : 'text-ink-soft')}>{formatShortDate(m.createdAt.slice(0, 10))}, {time(m.createdAt)}</p>
            </div>
          </li>
        ))}
        <li ref={endRef} aria-hidden />
      </ol>
      <form onSubmit={onSubmit} className="space-y-2 border-t border-line p-3">
        <FormError error={sendError} />
        <div className="flex gap-2">
          <label htmlFor="msg-body" className="sr-only">Escribir un mensaje</label>
          <textarea id="msg-body" rows={2} value={body} onChange={(e) => setBody(e.target.value)} placeholder="Escribí un mensaje…" maxLength={4000}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) onSubmit(e) }}
            className="min-h-11 flex-1 resize-none rounded-lg border border-field bg-surface px-3 py-2 text-sm" />
          <Button type="submit" size="icon" loading={sending} disabled={!body.trim()} aria-label="Enviar mensaje">{!sending && <Send aria-hidden className="size-4" />}</Button>
        </div>
      </form>
    </section>
  )
}

export default function MessagesPage() {
  useDocumentTitle('Mensajes')
  const [params, setParams] = useSearchParams()
  const selected = params.get('c')
  const { data, error, reload } = useServiceQuery(() => messagesService.listConversations(), [])
  const select = (id) => setParams(id ? { c: id } : {}, { replace: true })

  return (
    <>
      <AccountHeader title="Mensajes" description="Conversaciones sueltas. Las consultas, reservas y pedidos tienen su conversación adentro de cada solicitud." actions={<Button variant="secondary" to="/mi-cuenta/solicitudes">Ir a Solicitudes</Button>} />
      <DemoNotice className="mb-4">Mensajes de demostración. No es un chat en tiempo real: en esta versión nadie más recibe lo que escribís.</DemoNotice>
      {error ? <ErrorState error={error} onRetry={reload} /> : !data ? <LoadingSkeleton variant="list" count={3} />
        : data.length === 0 ? (
          <EmptyState icon={MessageSquare} title="Todavía no tenés conversaciones" description="Lo que consultes desde una sala, un espectáculo o un perfil queda en Solicitudes, con su conversación." action={<Button variant="secondary" to="/mi-cuenta/solicitudes">Ir a Solicitudes</Button>} />
        ) : (
          <div className="grid min-h-[32rem] overflow-hidden rounded-[var(--radius-card)] border border-line bg-surface md:grid-cols-[18rem_1fr]">
            <ul className={cn('divide-y divide-line border-line md:border-r', selected && 'hidden md:block')} aria-label="Conversaciones">
              {data.map((c) => (
                <li key={c.id}>
                  <button type="button" onClick={() => select(c.id)} aria-current={selected === c.id}
                    className={cn('flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-canvas', selected === c.id && 'bg-brand-soft')}>
                    <Avatar name={c.participants[0]} size="sm" />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-2">
                        <span className={cn('truncate text-sm', c.unread ? 'font-bold' : 'font-semibold')}>{c.participants.join(', ')}</span>
                        {c.lastMessage && <span className="shrink-0 text-xs text-ink-soft">{formatShortDate(c.lastMessage.createdAt.slice(0, 10))}</span>}
                      </span>
                      <span className="block truncate text-xs text-ink-soft">{c.subject}</span>
                      {c.lastMessage && <span className="block truncate text-sm text-ink-soft">{c.lastMessage.mine ? 'Vos: ' : ''}{c.lastMessage.body}</span>}
                    </span>
                    {c.unread > 0 && <span className="mt-1 rounded-full bg-brand px-2 text-xs font-semibold text-white">{c.unread}<span className="sr-only"> sin leer</span></span>}
                  </button>
                </li>
              ))}
            </ul>
            <div className={cn(!selected && 'hidden md:block')}>
              {selected ? <Conversation id={selected} onBack={() => select(null)} />
                : <div className="flex h-full items-center justify-center p-8 text-sm text-ink-soft">Elegí una conversación.</div>}
            </div>
          </div>
        )}
    </>
  )
}
