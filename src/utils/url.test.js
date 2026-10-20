import { describe, expect, it } from 'vitest'
import { isHost, safeHttpUrl } from './url'

describe('enlaces que carga la gente', () => {
  it('solo acepta http(s)', () => {
    expect(safeHttpUrl('https://festival.uy/postular')).toBe('https://festival.uy/postular')
    expect(safeHttpUrl('javascript:alert(1)')).toBeNull()
    expect(safeHttpUrl('data:text/html,hola')).toBeNull()
    expect(safeHttpUrl('festival.uy')).toBeNull()
    expect(safeHttpUrl('http://festival.uy', { httpsOnly: true })).toBeNull()
  })

  it('reconoce el dominio por el host, no por un texto en la URL', () => {
    expect(isHost('https://example.org/x', 'example.org')).toBe(true)
    expect(isHost('https://www.example.org/x', 'example.org')).toBe(true)
    expect(isHost('https://example.org.sitio-falso.com', 'example.org')).toBe(false)
    expect(isHost('https://malo.com/?example.org', 'example.org')).toBe(false)
    expect(isHost('https://notexample.org', 'example.org')).toBe(false)
  })
})
