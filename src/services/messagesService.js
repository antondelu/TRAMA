// Mensajería simulada. No es un chat en tiempo real: los mensajes nuevos de
// otras personas no llegan solos (en la demo no hay otras personas reales).

import { getDb, commit, latency, clone, newId, nowISO } from './adapter/demoStore'
import { requireUser } from './access'
import { forbidden, invalid, notFound } from './errors'
import { pushNotification } from './notificationsService'

const MAX_LENGTH = 4000

function participantNames(c, me) {
  const users = getDb().users
  return c.participantIds.filter((id) => id !== me).map((id) => {
    const u = users.find((x) => x.id === id)
    return u ? `${u.firstName} ${u.lastName}` : 'Cuenta eliminada'
  })
}

function summarize(c, me) {
  const msgs = getDb().messages.filter((m) => m.conversationId === c.id).sort((a, b) => a.createdAt.localeCompare(b.createdAt))
  const last = msgs.at(-1) ?? null
  return {
    ...c,
    participants: participantNames(c, me),
    lastMessage: last ? { body: last.body, createdAt: last.createdAt, mine: last.senderId === me } : null,
    unread: msgs.filter((m) => m.senderId !== me && !m.readAt).length,
  }
}

function getOwnConversation(id, userId) {
  const c = getDb().conversations.find((x) => x.id === id)
  if (!c) throw notFound('La conversación')
  if (!c.participantIds.includes(userId)) throw forbidden()
  return c
}

export const messagesService = {
  async listConversations() {
    await latency()
    const user = requireUser()
    return clone(getDb().conversations
      .filter((c) => c.participantIds.includes(user.id))
      .map((c) => summarize(c, user.id))
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)))
  },

  async unreadCount() {
    const user = requireUser()
    const mine = new Set(getDb().conversations.filter((c) => c.participantIds.includes(user.id)).map((c) => c.id))
    return getDb().messages.filter((m) => mine.has(m.conversationId) && m.senderId !== user.id && !m.readAt).length
  },

  // Abrir la conversación marca como leídos los mensajes recibidos.
  async getConversation(id) {
    await latency()
    const user = requireUser()
    const c = getOwnConversation(id, user.id)
    const now = nowISO()
    const msgs = getDb().messages.filter((m) => m.conversationId === id).sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    let changed = false
    for (const m of msgs) if (m.senderId !== user.id && !m.readAt) { m.readAt = now; changed = true }
    if (changed) commit()
    const users = getDb().users
    return clone({
      ...summarize(c, user.id),
      messages: msgs.map((m) => {
        const u = users.find((x) => x.id === m.senderId)
        return { ...m, mine: m.senderId === user.id, senderName: u ? `${u.firstName} ${u.lastName}` : 'Cuenta eliminada' }
      }),
    })
  },

  async send(conversationId, body) {
    await latency(150)
    const user = requireUser()
    const text = String(body ?? '').trim()
    if (!text) throw invalid('Escribí un mensaje.')
    if (text.length > MAX_LENGTH) throw invalid(`El mensaje no puede superar ${MAX_LENGTH} caracteres.`)
    const c = getOwnConversation(conversationId, user.id)
    const now = nowISO()
    getDb().messages.push({ id: newId('msg'), conversationId, senderId: user.id, body: text, readAt: null, createdAt: now })
    c.updatedAt = now
    for (const id of c.participantIds) {
      if (id !== user.id) pushNotification(id, 'new_message', `Nuevo mensaje de ${user.firstName} ${user.lastName}`, c.subject, '/mi-cuenta/mensajes')
    }
    commit()
  },
}
