import '@testing-library/jest-dom/vitest'
import { afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'

// Solo para pruebas: el AbortSignal de jsdom no es compatible con el Request
// de Node que usa React Router. La app no usa loaders, así que se omite.
const NodeRequest = globalThis.Request
globalThis.Request = class extends NodeRequest {
  constructor(input, init = {}) {
    const { signal: _signal, ...rest } = init
    super(input, rest)
  }
}

// jsdom no implementa scroll.
window.scrollTo = () => {}
Element.prototype.scrollIntoView = () => {}

afterEach(() => {
  cleanup()
  sessionStorage.clear()
  vi.useRealTimers()
})
