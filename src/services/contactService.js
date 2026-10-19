// Formulario de contacto: usa la API real de api/server.mjs (reutilizada del
// proyecto base), con desafío anti-spam y campo trampa para bots.
// Si la API no está corriendo o no tiene SMTP configurado, se informa el error.

import { INTEGRATIONS } from '@/config/integrations'
import { ServiceError } from './errors'

export const contactService = {
  async getChallenge() {
    const res = await fetch(INTEGRATIONS.contact.challenge).catch(() => null)
    if (!res?.ok) throw new ServiceError('unavailable', 'El formulario de contacto no está disponible en este momento.')
    return res.json()
  },

  async send({ name, email, company, msg, website, challenge, answer }) {
    const res = await fetch(INTEGRATIONS.contact.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, company, msg, website, challenge, answer, lang: 'es' }),
    }).catch(() => null)
    if (!res) throw new ServiceError('unavailable', 'No pudimos conectar con el servidor. Probá de nuevo en unos minutos.')
    if (res.ok) return { ok: true }
    const data = await res.json().catch(() => ({}))
    if (data.error === 'challenge') throw new ServiceError('challenge', 'La respuesta de verificación no es correcta. Probá con la nueva pregunta.')
    if (res.status === 429) throw new ServiceError('rate_limited', 'Enviaste varios mensajes seguidos. Esperá un minuto.')
    if (res.status === 503) throw new ServiceError('unavailable', 'El envío de correos todavía no está configurado en el servidor.')
    throw new ServiceError('failed', 'No pudimos enviar el mensaje. Revisá los datos y probá de nuevo.')
  },
}
