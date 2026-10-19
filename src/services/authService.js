// AUTENTICACIÓN DE DEMOSTRACIÓN — NO ES SEGURA.
// - No se guardan contraseñas (ni en texto plano ni de ninguna forma).
// - El ingreso solo comprueba que la cuenta exista y esté activa.
// Para producción, reemplazar este archivo por el proveedor elegido
// (ver docs/INTEGRACIONES.md). Las páginas no cambian: usan las mismas funciones.

import { getDb, commit, latency, clone, newId, nowISO } from './adapter/demoStore'
import { getSessionUserId, setSessionUserId } from './adapter/session'
import { rolesFor, activeMembership } from './access'
import { ServiceError, invalid } from './errors'
import { DEMO_LOGINS } from '@/data/mock/users'

// Solo los campos que la propia persona puede ver de sí misma.
function sessionView(user) {
  const { membership, plan } = activeMembership(user.id)
  return clone({ ...user, roles: rolesFor(user), storedRoles: user.roles, membership, plan })
}

export const authService = {
  isDemo: true,

  async getSession() {
    await latency(40)
    const id = getSessionUserId()
    const user = id && getDb().users.find((u) => u.id === id)
    if (!user || user.status !== 'active') {
      if (id) setSessionUserId(null)
      return null
    }
    return sessionView(user)
  },

  async login(email, _password) {
    await latency(300)
    const user = getDb().users.find((u) => u.email.toLowerCase() === String(email).trim().toLowerCase())
    if (!user) throw new ServiceError('invalid_credentials', 'No encontramos una cuenta con ese correo.')
    if (user.status !== 'active') throw new ServiceError('suspended', 'Esta cuenta está suspendida. Escribinos desde Contacto.')
    setSessionUserId(user.id)
    return sessionView(user)
  },

  async loginAsDemo(userId) {
    const user = getDb().users.find((u) => u.id === userId)
    return this.login(user?.email ?? '', '')
  },

  demoAccounts() {
    const users = getDb().users
    return DEMO_LOGINS.map((id) => users.find((u) => u.id === id)).filter(Boolean)
      .map((u) => ({ id: u.id, name: `${u.firstName} ${u.lastName}`, email: u.email, label: u.demoLabel }))
  },

  async register(data) {
    await latency(350)
    const db = getDb()
    const email = data.email.trim().toLowerCase()
    if (db.users.some((u) => u.email.toLowerCase() === email)) {
      throw invalid('Ya existe una cuenta con ese correo.', { email: 'Ya existe una cuenta con ese correo' })
    }
    const now = nowISO()
    const user = {
      id: newId('u'), email, firstName: data.firstName.trim(), lastName: data.lastName.trim(),
      avatar: null, bio: '', country: data.country, city: data.city, interests: data.interests ?? [],
      roles: ['user'], status: 'active', specialties: [], links: [],
      publicContact: { showEmail: false, phone: null }, privacy: { profilePublic: true },
      notificationPrefs: { email: true, requests: true, opportunities: true, messages: true },
      createdAt: now, updatedAt: now,
    }
    // La contraseña NO se guarda: en la demo no hay verificación.
    db.users.push(user)
    commit()
    setSessionUserId(user.id)
    return sessionView(user)
  },

  async logout() {
    await latency(60)
    setSessionUserId(null)
  },

  // Siempre responde lo mismo, exista o no la cuenta (no revela quién está registrado).
  async requestPasswordReset(_email) {
    await latency(300)
    return { sent: false, demo: true }
  },
}
