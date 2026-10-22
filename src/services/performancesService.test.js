import { beforeEach, describe, expect, it, vi } from 'vitest'
import cartelera from '@/data/cartelera/montevideo.json'
import { performancesService } from './performancesService'

// La cartelera es real y cambia cada vez que se actualiza: las pruebas se paran
// en el primer día del archivo y miran propiedades, no obras puntuales.
const firstDay = cartelera.from
const at = (time) => vi.setSystemTime(new Date(`${firstDay}T${time}:00-03:00`))

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] })
  at('09:00')
})

describe('cartelera de funciones', () => {
  it('el archivo tiene funciones y cada una apunta a una sala', () => {
    expect(cartelera.performances.length).toBeGreaterThan(0)
    const ids = new Set(cartelera.places.map((p) => p.id))
    expect(cartelera.performances.every((p) => ids.has(p.placeId))).toBe(true)
  })

  it('ordena por hora y trae la sala', async () => {
    const list = await performancesService.byDay(firstDay)
    expect(list.length).toBeGreaterThan(0)
    expect(list.map((p) => p.startsAt)).toEqual(list.map((p) => p.startsAt).sort())
    expect(list.every((p) => p.place?.name)).toBe(true)
  })

  it('las funciones de hoy que ya terminaron no aparecen', async () => {
    const morning = await performancesService.byDay(firstDay)
    at('23:59')
    const night = await performancesService.byDay(firstDay)
    expect(night.length).toBeLessThan(morning.length)
    expect(night.every((p) => new Date(p.endsAt) > new Date())).toBe(true)
  })

  it('cuenta las funciones de los próximos días empezando hoy', async () => {
    const days = await performancesService.nextDays(4)
    expect(days[0].date).toBe(firstDay)
    expect(days).toHaveLength(4)
    expect(days[1].count).toBe((await performancesService.byDay(days[1].date)).length)
  })
})
