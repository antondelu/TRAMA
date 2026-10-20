// Panel administrativo. Cada operación exige su permiso. En la demo los
// permisos se comprueban en esta capa; en producción, el servidor tiene que
// hacerlo y registrar cada acción en una auditoría persistente.

import { getDb, commit, latency, clone, newId, nowISO } from './adapter/demoStore'
import { requirePermission, rolesFor, activeMembership, currentUser } from './access'
import { forbidden, invalid, notFound } from './errors'
import { PUBLICATION_TYPES, transitionPublication } from './publications'
import { ASSIGNABLE_ROLES } from '@/constants/permissions'
import { matchesText } from './query'
import { todayISO } from '@/utils/dates'
import { opportunityPublicState } from '@/utils/workflows'

function audit(action, entityType, entityId, note = null) {
  getDb().auditLog.unshift({ id: newId('log'), at: nowISO(), by: currentUser()?.id, action, entityType, entityId, note })
}

const alive = (x) => !x.deletedAt

export const adminService = {
  async stats() {
    await latency()
    requirePermission('admin:access')
    const db = getDb()
    const today = todayISO()
    const published = (list) => list.filter((x) => alive(x) && x.publicationStatus === 'published').length
    const pending = Object.values(PUBLICATION_TYPES).reduce((n, c) =>
      n + db[c.collection].filter((x) => alive(x) && x[c.statusKey] === 'pending').length, 0)
    return {
      users: db.users.length,
      activeUsers: db.users.filter((u) => u.status === 'active').length,
      venues: published(db.venues),
      shows: published(db.shows),
      professionals: published(db.professionals),
      openOpportunities: db.opportunities.filter((o) => alive(o) && opportunityPublicState(o, today) === 'published').length,
      resources: published(db.resources),
      pendingModeration: pending,
      activeMemberships: db.memberships.filter((m) => m.status === 'active').length,
    }
  },

  async reports() {
    await latency()
    requirePermission('admin:reports')
    const db = getDb()
    const countBy = (list, key) => list.reduce((acc, x) => ({ ...acc, [x[key]]: (acc[x[key]] ?? 0) + 1 }), {})
    return clone({
      venuesByDepartment: countBy(db.venues.filter((v) => alive(v) && v.publicationStatus === 'published'), 'department'),
      showsByDiscipline: countBy(db.shows.filter((s) => alive(s) && s.publicationStatus === 'published'), 'discipline'),
      bookingsByStatus: countBy(db.bookingRequests, 'status'),
      applicationsByStatus: countBy(db.applications, 'status'),
      inquiriesByStatus: countBy([...(db.venueInquiries ?? []), ...db.showInquiries, ...db.serviceInquiries], 'status'),
      membershipsByPlan: countBy(db.memberships.filter((m) => m.status === 'active'), 'planId'),
      auditLog: db.auditLog.slice(0, 30),
    })
  },

  async listUsers({ q = '', status = '', role = '' } = {}) {
    await latency()
    requirePermission('admin:users')
    return clone(getDb().users
      .filter((u) => matchesText(q, [u.firstName, u.lastName, u.email, u.city]) && (!status || u.status === status))
      .map((u) => ({ ...u, effectiveRoles: rolesFor(u), plan: activeMembership(u.id).plan?.name ?? 'Comunidad' }))
      .filter((u) => !role || u.effectiveRoles.includes(role)))
  },

  async setUserRoles(userId, roles) {
    await latency(150)
    const admin = requirePermission('admin:roles')
    const user = getDb().users.find((u) => u.id === userId)
    if (!user) throw notFound('La cuenta')
    const clean = [...new Set(['user', ...roles.filter((r) => ASSIGNABLE_ROLES.includes(r))])]
    if (user.id === admin.id && !clean.includes('admin')) throw forbidden('No podés quitarte el rol de administrador a vos mismo.')
    user.roles = clean
    user.updatedAt = nowISO()
    audit('roles', 'user', userId, clean.join(', '))
    commit()
  },

  async setUserStatus(userId, status) {
    await latency(150)
    const admin = requirePermission('admin:users')
    if (!['active', 'suspended'].includes(status)) throw invalid('Estado no válido.')
    if (userId === admin.id) throw forbidden('No podés suspender tu propia cuenta.')
    const user = getDb().users.find((u) => u.id === userId)
    if (!user) throw notFound('La cuenta')
    user.status = status
    user.updatedAt = nowISO()
    audit(status === 'suspended' ? 'suspend' : 'reactivate', 'user', userId)
    commit()
  },

  // Cola de moderación: por defecto, lo pendiente.
  async moderationQueue({ type = '', status = 'pending' } = {}) {
    await latency()
    requirePermission('admin:moderate')
    const db = getDb()
    const out = []
    for (const [key, c] of Object.entries(PUBLICATION_TYPES)) {
      if (type && key !== type) continue
      for (const item of db[c.collection]) {
        if (!alive(item) || (status && item[c.statusKey] !== status)) continue
        const owner = db.users.find((u) => u.id === item.ownerId)
        out.push({
          type: key, typeLabel: c.label, id: item.id, slug: item.slug, title: item[c.titleKey],
          status: item[c.statusKey], ownerName: owner ? `${owner.firstName} ${owner.lastName}` : '—',
          description: item.description ?? '', moderationNote: item.moderationNote ?? null, updatedAt: item.updatedAt,
        })
      }
    }
    return clone(out.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)))
  },

  // action: published | rejected | changes_requested | archived
  async moderate(type, id, action, note = '') {
    await latency(150)
    requirePermission('admin:moderate')
    if (['rejected', 'changes_requested'].includes(action) && !note.trim()) {
      throw invalid('Escribí el motivo para que quien publicó sepa qué corregir.')
    }
    return clone(transitionPublication(type, id, action, { note: note.trim() || null }))
  },

  async listOpportunities({ status = '' } = {}) {
    await latency()
    requirePermission('admin:moderate')
    const today = todayISO()
    return clone(getDb().opportunities.filter(alive)
      .map((o) => ({ ...o, publicState: opportunityPublicState(o, today) }))
      .filter((o) => !status || o.publicState === status)
      .sort((a, b) => a.deadline.localeCompare(b.deadline)))
  },

  // Cerrar una convocatoria antes de su fecha (por ejemplo, si el origen no se pudo verificar).
  async closeOpportunity(id, note = '') {
    await latency(150)
    requirePermission('admin:moderate')
    const o = getDb().opportunities.find((x) => x.id === id)
    if (!o) throw notFound('La convocatoria')
    if (o.status !== 'published') throw invalid('Solo se pueden cerrar convocatorias publicadas.')
    o.status = 'closed'
    o.updatedAt = nowISO()
    audit('close', 'opportunity', id, note || null)
    commit()
  },
}
