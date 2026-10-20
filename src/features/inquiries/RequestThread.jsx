import { forwardRef, useState } from 'react'
import { Send } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { FormField, Textarea } from '@/components/forms/FormField'
import { FormError } from '@/components/forms/FormError'
import { requestsService } from '@/services'
import { useToast } from '@/context/ToastContext'
import { cn, formatShortDate } from '@/utils/format'

// Conversación de una solicitud: el primer mensaje y todas las respuestas,
// con un cuadro para escribir mientras la solicitud siga abierta.
// `ref` apunta al cuadro de texto, para que "Responder" lo enfoque.
export const RequestThread = forwardRef(function RequestThread({ request: r }, ref) {
  const { success } = useToast()
  const [body, setBody] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  async function send(e) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      await requestsService.reply(r.kind, r.id, body)
      setBody('')
      success('Mensaje enviado', r.entityTitle)
    } catch (err) {
      setError(err)
    } finally {
      setBusy(false)
    }
  }

  return (
    <section aria-label="Conversación" className="space-y-3">
      <h3 className="text-sm font-semibold">Conversación</h3>
      {r.thread.length === 0 ? (
        <p className="text-sm text-ink-soft">Todavía no hay mensajes.</p>
      ) : (
        <ol className="space-y-3">
          {r.thread.map((m) => (
            <li key={m.id} className={cn('flex gap-2.5', m.mine && 'flex-row-reverse')}>
              <Avatar name={m.senderName} size="sm" />
              <div className={cn('max-w-[85%] rounded-2xl px-3.5 py-2.5', m.mine ? 'bg-brand text-white' : 'bg-canvas')}>
                <p className={cn('text-sm font-semibold', m.mine ? 'text-white/85' : 'text-ink-soft')}>
                  {m.mine ? 'Vos' : m.senderName} · {formatShortDate(m.at.slice(0, 10))}
                </p>
                <p className="mt-0.5 whitespace-pre-line">{m.body}</p>
              </div>
            </li>
          ))}
        </ol>
      )}
      {r.canReply ? (
        <form onSubmit={send} className="space-y-2">
          <FormField label="Tu respuesta">
            <Textarea ref={ref} rows={3} value={body} onChange={(e) => setBody(e.target.value)} maxLength={4000} />
          </FormField>
          <FormError error={error} />
          <div className="flex justify-end">
            <Button type="submit" size="sm" icon={Send} loading={busy} disabled={!body.trim()}>Enviar respuesta</Button>
          </div>
        </form>
      ) : r.status !== 'draft' && (
        <p className="text-sm text-ink-soft">Esta solicitud terminó: ya no se pueden agregar mensajes.</p>
      )}
    </section>
  )
})
