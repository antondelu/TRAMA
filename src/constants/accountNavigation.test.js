import { describe, expect, it } from 'vitest'
import { accountGroups, currentAccountSection } from './accountNavigation'

const all = () => true
const none = () => false

describe('secciones de Mi cuenta', () => {
  it('agrupa las secciones y muestra Calendario y Gestión de recursos solo con permiso', () => {
    const labels = (can) => accountGroups(can).map((g) => [g.title, g.items.map((i) => i.label)])
    expect(labels(none)).toEqual([
      ['Lo que te llegó', ['Solicitudes', 'Mensajes', 'Notificaciones']],
      ['Lo tuyo', ['Publicaciones', 'Favoritos']],
      ['Tu cuenta', ['Perfil', 'Membresía', 'Configuración']],
    ])
    expect(labels(all)[1][1]).toEqual(['Publicaciones', 'Favoritos', 'Calendario', 'Gestión de recursos'])
  })

  it('reconoce la sección actual, también en rutas anidadas', () => {
    expect(currentAccountSection('/mi-cuenta', all).label).toBe('Resumen')
    expect(currentAccountSection('/mi-cuenta/solicitudes', all).label).toBe('Solicitudes')
    expect(currentAccountSection('/mi-cuenta/recursos/gestion', all).label).toBe('Gestión de recursos')
  })
})
