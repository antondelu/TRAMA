// Planes y membresías. NO hay pagos: activar un plan en la demo solo cambia
// datos locales y queda marcado como "activado en modo demo, sin cobro".
// La integración real (Mercado Pago, Stripe...) completaría
// providerSubscriptionId y confirmaría el estado desde el servidor.

import { getDb, commit, latency, clone, newId, nowISO } from './adapter/demoStore'
import { activeMembership, requirePermission, requireUser } from './access'
import { invalid, notFound } from './errors'
import { pushNotification } from './notificationsService'

export const membershipsService = {
  async listPlans({ includeInactive = false } = {}) {
    await latency()
    return clone(getDb().membershipPlans.filter((p) => includeInactive || p.isActive))
  },

  async getMine() {
    await latency()
    const user = requireUser()
    const db = getDb()
    const { membership, plan } = activeMembership(user.id)
    const history = db.memberships.filter((m) => m.userId === user.id)
    const freePlan = db.membershipPlans.find((p) => p.price === 0)
    return clone({ membership, plan: plan ?? freePlan, history })
  },

  async activateDemo(planId, billing = 'monthly') {
    await latency(250)
    const user = requireUser()
    const db = getDb()
    const plan = db.membershipPlans.find((p) => p.id === planId && p.isActive)
    if (!plan) throw notFound('El plan')
    if (!['monthly', 'yearly'].includes(billing)) throw invalid('Periodicidad no válida.')
    for (const m of db.memberships) if (m.userId === user.id && m.status === 'active') m.status = 'cancelled'
    if (plan.price === 0) {
      commit()
      return null
    }
    const start = new Date()
    const end = new Date(start)
    end.setMonth(end.getMonth() + (billing === 'yearly' ? 12 : 1))
    const membership = {
      id: newId('m'), userId: user.id, planId, status: 'active', billing, demo: true,
      startAt: start.toISOString(), endAt: end.toISOString(), providerSubscriptionId: null,
    }
    db.memberships.push(membership)
    pushNotification(user.id, 'membership', `Plan ${plan.name} activado en modo demo`, 'No se realizó ningún cobro.', '/mi-cuenta/membresia')
    commit()
    return clone(membership)
  },

  async cancel() {
    await latency(150)
    const user = requireUser()
    const db = getDb()
    const m = db.memberships.find((x) => x.userId === user.id && x.status === 'active')
    if (!m) throw notFound('La membresía activa')
    m.status = 'cancelled'
    m.cancelledAt = nowISO()
    commit()
  },

  // --- Administración de planes ---
  async savePlan(data) {
    await latency(150)
    requirePermission('admin:plans')
    const db = getDb()
    if (!data.name?.trim()) throw invalid('Falta el nombre del plan.')
    if (!(Number(data.price) >= 0)) throw invalid('El precio no es válido.')
    const existing = db.membershipPlans.find((p) => p.id === data.id)
    const clean = { ...data, price: Number(data.price), priceYearly: Number(data.priceYearly ?? 0), demoPrice: true }
    if (existing) Object.assign(existing, clean)
    else db.membershipPlans.push({ benefits: [], limits: [], accessRules: ['public'], currency: 'UYU', ...clean, id: newId('plan') })
    commit()
  },
}
