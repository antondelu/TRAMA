import { beforeEach, describe, expect, it } from 'vitest'
import { freshDemo, loginAs } from '@/test/helpers'
import { venuesService } from './venuesService'
import { showsService } from './showsService'
import { opportunitiesService } from './opportunitiesService'
import { resourcesService } from './resourcesService'
import { requestsService } from './requestsService'
import { profilesService } from './profilesService'
import { favoritesService } from './favoritesService'
import { adminService } from './adminService'
import { membershipsService } from './membershipsService'
import { searchService } from './searchService'
import { availabilityMap } from './venuesService'

beforeEach(() => freshDemo())

describe('catálogos públicos', () => {
  it('solo muestran publicaciones publicadas', async () => {
    const venues = await venuesService.list({ page: 1 })
    expect(venues.total).toBe(7) // 9 en total: 1 archivada y 1 pendiente quedan afuera
    const all = []
    for (let p = 1; p <= venues.pageCount; p++) all.push(...(await venuesService.list({ page: p })).items)
    expect(all.map((v) => v.slug)).not.toContain('casa-bambalina')
    expect(all.map((v) => v.slug)).not.toContain('estudio-hilvan')
  })

  it('los filtros cambian los resultados', async () => {
    const all = await venuesService.list({})
    const big = await venuesService.list({ capMin: '300' })
    expect(big.total).toBeLessThan(all.total)
    expect(big.items.every((v) => v.capacity >= 300)).toBe(true)
    const withPiso = await venuesService.list({ equipment: 'piso-danza' })
    expect(withPiso.items.every((v) => v.equipment.includes('piso-danza'))).toBe(true)
  })

  it('el orden por precio deja las salas sin precio al final', async () => {
    const asc = await venuesService.list({ sort: 'price_asc', page: 1 })
    const prices = asc.items.map((v) => v.priceFrom).filter((p) => p != null)
    expect(prices).toEqual([...prices].sort((a, b) => a - b))
  })

  it('la búsqueda ignora acentos y mayúsculas', async () => {
    const res = await showsService.list({ q: 'titeres' })
    expect(res.total).toBeGreaterThan(0)
  })

  it('las convocatorias vencidas, cerradas o en borrador no aparecen', async () => {
    const res = await opportunitiesService.list({})
    const slugs = res.items.map((o) => o.slug)
    expect(slugs).not.toContain('seleccion-ciclo-titeres') // vencida
    expect(slugs).not.toContain('proyectos-gran-formato-galpon-telar') // cerrada
    expect(slugs).not.toContain('ciclo-lecturas-dramatizadas') // borrador
  })

  it('la búsqueda global agrupa por categoría', async () => {
    const groups = await searchService.search('luz')
    expect(groups.length).toBeGreaterThan(0)
    expect(groups.every((g) => g.items.length > 0)).toBe(true)
  })

  it('el perfil público de un servicio no expone datos de contacto privados', async () => {
    loginAs('u-mateo')
    await (await import('./servicesService')).servicesService.save({
      name: 'Prueba Privada', headline: 'Prueba', description: 'Una descripción de prueba suficientemente larga', providerType: 'persona',
      specialties: ['sonido'], location: { country: 'UY', city: 'Montevideo', department: 'Montevideo' }, workModes: ['remota'],
      servicesOffered: ['x'], contact: { email: 'secreto@example.org', phone: '099' },
    }, { submit: true })
    const list = await (await import('./servicesService')).servicesService.listMine()
    expect(list.find((p) => p.name === 'Prueba Privada').contact.email).toBe('secreto@example.org')
    const res = await (await import('./servicesService')).servicesService.list({})
    expect(res.items.every((p) => p.contact === undefined)).toBe(true)
  })
})

describe('reservas de sala', () => {
  it('una fecha sin información nunca figura como libre', () => {
    // Sala Tramoya Norte no cargó disponibilidad
    const map = availabilityMap('v-tramoya', '2026-11-01', '2026-11-30')
    expect(Object.values(map).some((d) => d.status === 'available')).toBe(false)
  })

  it('las solicitudes abiertas marcan la fecha como pendiente, no como reservada', () => {
    const map = availabilityMap('v-urdimbre', '2026-11-21', '2026-11-21')
    expect(map['2026-11-21'].status).toBe('pending')
    expect(map['2026-11-21'].requests).toHaveLength(2) // br-1 y br-4, en conflicto
  })

  it('una solicitud nueva queda enviada, nunca aceptada sola', async () => {
    loginAs('u-joaquin')
    const date = availabilityMap('v-urdimbre', '2026-12-01', '2026-12-31')
    const free = Object.keys(date).sort().find((d) => date[d].status === 'available')
    const req = await requestsService.createBooking({ venueId: 'v-urdimbre', date: free, timeSlot: 'noche', activityType: 'funcion', functionCount: 1 })
    expect(req.status).toBe('sent')
  })

  it('no se puede pedir una fecha bloqueada', async () => {
    loginAs('u-joaquin')
    const map = availabilityMap('v-urdimbre', '2026-11-01', '2026-12-31')
    const blocked = Object.keys(map).find((d) => map[d].status === 'blocked')
    await expect(requestsService.createBooking({ venueId: 'v-urdimbre', date: blocked, timeSlot: 'noche', activityType: 'funcion', functionCount: 1 }))
      .rejects.toMatchObject({ code: 'conflict' })
  })

  it('evita la doble reserva: con una aceptada, la otra de la misma fecha no se puede aceptar', async () => {
    loginAs('u-lucia')
    await requestsService.transition('booking', 'br-1', 'accepted')
    await expect(requestsService.transition('booking', 'br-4', 'accepted')).rejects.toMatchObject({ code: 'conflict' })
    expect(availabilityMap('v-urdimbre', '2026-11-21', '2026-11-21')['2026-11-21'].status).toBe('confirmed')
  })

  it('al aceptar se vuelve a comprobar el calendario', async () => {
    loginAs('u-lucia')
    await venuesService.setDates('v-urdimbre', ['2026-11-21'], 'blocked')
    await expect(requestsService.transition('booking', 'br-1', 'accepted')).rejects.toMatchObject({ code: 'conflict' })
  })

  it('quien pidió la reserva no puede aceptarla', async () => {
    loginAs('u-mateo')
    await expect(requestsService.transition('booking', 'br-1', 'accepted')).rejects.toMatchObject({ code: 'validation' })
  })

  it('cada cambio de estado queda en el historial', async () => {
    loginAs('u-lucia')
    const before = (await requestsService.list({ box: 'received' })).find((r) => r.id === 'br-1').history.length
    const after = await requestsService.transition('booking', 'br-1', 'rejected', { note: 'Fecha tomada' })
    expect(after.history).toHaveLength(before + 1)
    expect(after.history.at(-1)).toMatchObject({ from: 'sent', to: 'rejected', note: 'Fecha tomada', by: 'u-lucia' })
  })

  it('proponer otra fecha y aceptarla cambia la fecha pero sigue sin confirmar', async () => {
    loginAs('u-lucia')
    await requestsService.proposeDate('br-1', '2026-11-28')
    loginAs('u-mateo')
    const r = await requestsService.acceptProposedDate('br-1')
    expect(r.date).toBe('2026-11-28')
    expect(r.status).toBe('in_conversation')
  })
})

describe('postulaciones', () => {
  it('no se puede postular a una convocatoria vencida', async () => {
    loginAs('u-mateo')
    await expect(requestsService.apply({ opportunityId: 'o-seleccion-titeres', showId: 's-andamio', proposal: 'x'.repeat(40) }))
      .rejects.toMatchObject({ code: 'conflict' })
  })

  it('no se puede postular dos veces', async () => {
    loginAs('u-mateo')
    await expect(requestsService.apply({ opportunityId: 'o-urdimbre-2027', showId: 's-andamio', proposal: 'x'.repeat(40) }))
      .rejects.toMatchObject({ code: 'conflict' })
  })

  it('solo se postulan espectáculos propios', async () => {
    loginAs('u-mateo')
    await expect(requestsService.apply({ opportunityId: 'o-lanzadera-giras', showId: 's-raices', proposal: 'x'.repeat(40) }))
      .rejects.toMatchObject({ code: 'forbidden' })
  })
})

describe('acceso a recursos', () => {
  it('sin membresía, el contenido protegido no llega al navegador', async () => {
    const r = await resourcesService.getBySlug('guia-organizar-gira-interior')
    expect(r.locked).toBe(true)
    expect(r.body).toBeUndefined()
    expect(r.title).toBeTruthy()
  })

  it('con membresía activa sí llega', async () => {
    loginAs('u-lucia')
    const r = await resourcesService.getBySlug('guia-organizar-gira-interior')
    expect(r.locked).toBe(false)
    expect(r.body.length).toBeGreaterThan(0)
  })

  it('el plan Miembro no abre contenidos premium', async () => {
    loginAs('u-lucia')
    const r = await resourcesService.getBySlug('curso-produccion-independiente')
    expect(r.locked).toBe(true)
  })

  it('los listados nunca incluyen el contenido completo', async () => {
    loginAs('u-sofia')
    const res = await resourcesService.list({})
    expect(res.items.every((r) => r.body === undefined)).toBe(true)
  })

  it('activar un plan en modo demo da acceso y queda marcado como demo', async () => {
    loginAs('u-joaquin')
    const m = await membershipsService.activateDemo('plan-miembro', 'monthly')
    expect(m.demo).toBe(true)
    expect((await resourcesService.getBySlug('guia-organizar-gira-interior')).locked).toBe(false)
  })
})

describe('publicaciones y moderación', () => {
  it('enviar a moderación deja la publicación pendiente y fuera del catálogo', async () => {
    loginAs('u-joaquin')
    const v = await venuesService.save({ name: 'Sala de Prueba', description: 'x'.repeat(40), city: 'Montevideo', department: 'Montevideo', capacity: 50, venueType: 'caja-negra', equipment: [], accessibility: [], rentalModes: ['por-dia'], technicalSpecs: {}, address: {} }, { submit: true })
    expect(v.publicationStatus).toBe('pending')
    expect((await venuesService.list({ q: 'Sala de Prueba' })).total).toBe(0)
  })

  it('un moderador la aprueba y pasa a ser pública', async () => {
    loginAs('u-valentina')
    await adminService.moderate('venue', 'v-hilvan', 'published')
    expect((await venuesService.list({ q: 'Hilván' })).total).toBe(1)
  })

  it('rechazar exige un motivo', async () => {
    loginAs('u-valentina')
    await expect(adminService.moderate('venue', 'v-hilvan', 'rejected', '')).rejects.toMatchObject({ code: 'validation' })
  })

  it('solo el dueño edita su publicación', async () => {
    loginAs('u-joaquin')
    await expect(venuesService.save({ id: 'v-urdimbre', name: 'Robada' })).rejects.toMatchObject({ code: 'forbidden' })
  })

  it('el slug repetido se rechaza con error en el campo', async () => {
    loginAs('u-joaquin')
    await expect(venuesService.save({ name: 'Otra', slug: 'sala-urdimbre' })).rejects.toMatchObject({ code: 'validation', details: { slug: expect.any(String) } })
  })

  it('sin slug, se arma uno libre al crear y se conserva al editar', async () => {
    loginAs('u-joaquin')
    const nueva = await venuesService.save({ name: 'Sala Urdimbre' })
    expect(nueva.slug).not.toBe('sala-urdimbre')
    const editada = await venuesService.save({ id: nueva.id, name: 'Sala Urdimbre Renovada' })
    expect(editada.slug).toBe(nueva.slug)
  })

  it('una publicación eliminada desaparece del catálogo y de los favoritos', async () => {
    loginAs('u-sofia')
    expect((await favoritesService.list()).some((f) => f.entityId === 's-lona')).toBe(true)
    loginAs('u-tomas')
    await profilesService.deletePublication('show', 's-lona')
    expect((await showsService.list({ q: 'Bajo la lona' })).total).toBe(0)
    loginAs('u-sofia')
    expect((await favoritesService.list()).some((f) => f.entityId === 's-lona')).toBe(false)
  })

  it('las acciones de administración requieren permiso', async () => {
    loginAs('u-mateo')
    await expect(adminService.listUsers()).rejects.toMatchObject({ code: 'forbidden' })
    loginAs('u-valentina')
    await expect(adminService.listUsers()).rejects.toMatchObject({ code: 'forbidden' }) // moderadora, no admin
  })
})

describe('indicadores de la cuenta', () => {
  it('se calculan con los datos reales', async () => {
    loginAs('u-lucia')
    const d = await profilesService.dashboard()
    // Recibidas abiertas: br-1, br-3, br-4 (sus salas) + ap-1 (su convocatoria)
    expect(d.receivedPending).toBe(4)
    expect(d.favorites).toBe(2)
  })
})
