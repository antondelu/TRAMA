// Roles y permisos. Una persona puede tener varios roles a la vez (por ejemplo
// responsable de sala y profesional de servicios).
//
// IMPORTANTE: esto decide qué muestra la interfaz. No es seguridad: en
// producción el servidor tiene que volver a comprobar cada permiso, sin
// confiar en los roles que envíe el navegador.

export const ROLES = {
  visitor: 'Visitante',
  user: 'Usuario registrado',
  venue_manager: 'Responsable de sala',
  show_manager: 'Responsable de espectáculo o compañía',
  service_provider: 'Profesional de servicios',
  member: 'Miembro',
  editor: 'Editor de contenido',
  moderator: 'Moderador',
  admin: 'Administrador',
}

// Roles que se guardan en la cuenta (los asigna un administrador).
export const ASSIGNABLE_ROLES = ['user', 'editor', 'moderator', 'admin']

export const PERMISSIONS = {
  'favorites:manage': ['user'],
  'requests:manage': ['user'],
  'publications:create': ['user'],
  'calendar:manage': ['venue_manager', 'admin'],
  'resources:member': ['member', 'editor', 'admin'],
  'resources:premium': ['premium_member', 'editor', 'admin'],
  'resources:manage': ['editor', 'admin'],
  'admin:access': ['editor', 'moderator', 'admin'],
  'admin:moderate': ['moderator', 'admin'],
  'admin:users': ['admin'],
  'admin:roles': ['admin'],
  'admin:plans': ['admin'],
  'admin:reports': ['moderator', 'admin'],
  'admin:config': ['admin'],
}

// Roles efectivos: los guardados más los que surgen de lo que la persona tiene
// (membresía activa, salas, espectáculos o servicios publicados a su nombre).
export function effectiveRoles(user, { membership, plan, owns = {} } = {}) {
  if (!user) return ['visitor']
  const roles = new Set(['user', ...(user.roles ?? [])])
  if (membership?.status === 'active' && plan) {
    roles.add('member')
    if (plan.accessRules?.includes('premium')) roles.add('premium_member')
  }
  if (owns.venues) roles.add('venue_manager')
  if (owns.shows) roles.add('show_manager')
  if (owns.services) roles.add('service_provider')
  return [...roles]
}

export function hasPermission(roles, permission) {
  const allowed = PERMISSIONS[permission]
  if (!allowed) return false
  return roles.some((role) => allowed.includes(role))
}
