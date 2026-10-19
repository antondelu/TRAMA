import { vi } from 'vitest'
import { resetDemoData } from '@/services/adapter/demoStore'
import { setSessionUserId } from '@/services/adapter/session'

// Fecha fija para que las pruebas no dependan del día en que se corren
// (las convocatorias de la demo tienen fechas límite reales).
export const TEST_TODAY = '2026-10-19T12:00:00-03:00'

export function freshDemo(userId = null) {
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(new Date(TEST_TODAY))
  resetDemoData()
  setSessionUserId(userId)
}

export function loginAs(userId) {
  setSessionUserId(userId)
}
