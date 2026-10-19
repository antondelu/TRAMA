import { describe, expect, it } from 'vitest'
import { effectiveRoles, hasPermission } from './permissions'

describe('roles y permisos', () => {
  it('sin sesión solo se es visitante', () => {
    expect(effectiveRoles(null)).toEqual(['visitor'])
    expect(hasPermission(['visitor'], 'favorites:manage')).toBe(false)
  })

  it('una persona puede tener varios perfiles a la vez', () => {
    const roles = effectiveRoles({ roles: ['user'] }, { owns: { venues: true, services: true } })
    expect(roles).toEqual(expect.arrayContaining(['user', 'venue_manager', 'service_provider']))
  })

  it('la membresía activa da acceso a recursos de miembros; premium solo con plan premium', () => {
    const member = effectiveRoles({ roles: ['user'] }, { membership: { status: 'active' }, plan: { accessRules: ['public', 'member'] } })
    expect(hasPermission(member, 'resources:member')).toBe(true)
    expect(hasPermission(member, 'resources:premium')).toBe(false)
    const pro = effectiveRoles({ roles: ['user'] }, { membership: { status: 'active' }, plan: { accessRules: ['public', 'member', 'premium'] } })
    expect(hasPermission(pro, 'resources:premium')).toBe(true)
  })

  it('una membresía vencida no da acceso', () => {
    const roles = effectiveRoles({ roles: ['user'] }, { membership: { status: 'expired' }, plan: { accessRules: ['member'] } })
    expect(roles).not.toContain('member')
  })

  it('moderar requiere rol de moderador o admin', () => {
    expect(hasPermission(['user', 'editor'], 'admin:moderate')).toBe(false)
    expect(hasPermission(['user', 'moderator'], 'admin:moderate')).toBe(true)
    expect(hasPermission(['user', 'moderator'], 'admin:users')).toBe(false)
  })
})
