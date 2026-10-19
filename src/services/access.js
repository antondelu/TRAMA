// Controles de acceso del lado "servidor" del modo demo. Los servicios los
// llaman antes de devolver o modificar datos. En producción, este trabajo lo
// hace el backend con la sesión real.

import { getDb } from './adapter/demoStore'
import { getSessionUserId } from './adapter/session'
import { effectiveRoles, hasPermission } from '@/constants/permissions'
import { forbidden, unauthenticated } from './errors'

export function currentUser() {
  const id = getSessionUserId()
  if (!id) return null
  const user = getDb().users.find((u) => u.id === id)
  return user && user.status === 'active' ? user : null
}

export function activeMembership(userId) {
  const db = getDb()
  const membership = db.memberships.find((m) => m.userId === userId && m.status === 'active')
  const plan = membership ? db.membershipPlans.find((p) => p.id === membership.planId) : null
  return { membership: membership ?? null, plan: plan ?? null }
}

const alive = (item) => !item.deletedAt

export function rolesFor(user) {
  if (!user) return ['visitor']
  const db = getDb()
  const owns = {
    venues: db.venues.some((v) => v.ownerId === user.id && alive(v)),
    shows: db.shows.some((s) => s.ownerId === user.id && alive(s)),
    services: db.professionals.some((p) => p.ownerId === user.id && alive(p)),
  }
  return effectiveRoles(user, { ...activeMembership(user.id), owns })
}

export function can(permission, user = currentUser()) {
  return hasPermission(rolesFor(user), permission)
}

export function requireUser() {
  const user = currentUser()
  if (!user) throw unauthenticated()
  return user
}

export function requirePermission(permission) {
  const user = requireUser()
  if (!can(permission, user)) throw forbidden()
  return user
}

export function isModerator(user = currentUser()) {
  return can('admin:moderate', user)
}

// El dueño puede editar lo suyo; un moderador puede revisar todo.
export function requireOwner(item, { allowModerator = false } = {}) {
  const user = requireUser()
  if (item.ownerId === user.id) return user
  if (allowModerator && isModerator(user)) return user
  throw forbidden('Solo quien publicó este contenido puede modificarlo.')
}
