// Notificaciones. La estructura (type, title, body, targetUrl) está pensada
// para enviarse también por email o push cuando exista esa infraestructura.

import { getDb, commit, newId, nowISO, latency, clone } from './adapter/demoStore'
import { requireUser } from './access'
import { notFound } from './errors'

export const NOTIFICATION_TYPES = {
  new_request: 'Nueva solicitud',
  request_response: 'Respuesta a una solicitud',
  status_change: 'Cambio de estado',
  opportunity_closing: 'Convocatoria por cerrar',
  new_message: 'Nuevo mensaje',
  membership: 'Membresía',
  admin_notice: 'Aviso administrativo',
}

// Uso interno de otros servicios. No hace commit: lo hace quien llama.
export function pushNotification(userId, type, title, body, targetUrl) {
  getDb().notifications.unshift({ id: newId('n'), userId, type, title, body, targetUrl, readAt: null, createdAt: nowISO() })
}

export const notificationsService = {
  async list({ unreadOnly = false } = {}) {
    await latency()
    const user = requireUser()
    const items = getDb().notifications
      .filter((n) => n.userId === user.id && (!unreadOnly || !n.readAt))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    return clone(items)
  },


  async markRead(id) {
    await latency(60)
    const user = requireUser()
    const n = getDb().notifications.find((x) => x.id === id && x.userId === user.id)
    if (!n) throw notFound('La notificación')
    n.readAt ??= nowISO()
    commit()
  },

  async markAllRead() {
    await latency(60)
    const user = requireUser()
    const now = nowISO()
    for (const n of getDb().notifications) if (n.userId === user.id && !n.readAt) n.readAt = now
    commit()
  },
}
