import { describe, expect, it } from 'vitest'
import { allowedTransitions, canTransitionPublication, canTransitionRequest, opportunityPublicState, stateLabelFor } from './workflows'

describe('máquinas de estado de solicitudes', () => {
  it('una reserva enviada solo la acepta quien la recibe', () => {
    expect(canTransitionRequest('booking', 'sent', 'accepted', 'receiver')).toBe(true)
    expect(canTransitionRequest('booking', 'sent', 'accepted', 'sender')).toBe(false)
  })

  it('quien envía puede cancelar, pero no rechazar', () => {
    expect(allowedTransitions('booking', 'sent', 'sender')).toEqual(['cancelled'])
  })

  it('los estados finales no tienen transiciones', () => {
    for (const s of ['rejected', 'cancelled', 'completed']) {
      expect(allowedTransitions('booking', s, 'receiver')).toEqual([])
      expect(allowedTransitions('booking', s, 'sender')).toEqual([])
    }
  })

  it('las postulaciones tienen su propio flujo, distinto de las reservas', () => {
    expect(canTransitionRequest('application', 'sent', 'under_review', 'receiver')).toBe(true)
    expect(canTransitionRequest('booking', 'sent', 'under_review', 'receiver')).toBe(false)
    expect(canTransitionRequest('application', 'under_review', 'withdrawn', 'sender')).toBe(true)
  })

  it('"Enviada" se ve como "Recibida" del otro lado', () => {
    expect(stateLabelFor('sent', 'sender')).toBe('Enviada')
    expect(stateLabelFor('sent', 'receiver')).toBe('Recibida')
  })
})

describe('máquina de estado de publicaciones', () => {
  it('el dueño no puede publicar directamente: solo enviar a moderación', () => {
    expect(canTransitionPublication('draft', 'published', 'owner')).toBe(false)
    expect(canTransitionPublication('draft', 'pending', 'owner')).toBe(true)
    expect(canTransitionPublication('pending', 'published', 'owner')).toBe(false)
  })

  it('un moderador aprueba, rechaza o pide cambios', () => {
    for (const to of ['published', 'rejected', 'changes_requested']) expect(canTransitionPublication('pending', to, 'moderator')).toBe(true)
  })
})

describe('estado público de una convocatoria', () => {
  const base = { status: 'published', deadline: '2026-10-31' }
  it('vencida si la fecha límite ya pasó, aunque esté guardada como publicada', () => {
    expect(opportunityPublicState(base, '2026-11-01')).toBe('expired')
    expect(opportunityPublicState(base, '2026-10-31')).toBe('published')
  })
  it('respeta los estados no publicados', () => {
    expect(opportunityPublicState({ ...base, status: 'closed' }, '2026-10-01')).toBe('closed')
  })
})
