// Errores de servicio con un código estable, para que las vistas sepan qué
// mostrar (no encontrado, sin permiso, conflicto...) sin leer textos.

export class ServiceError extends Error {
  constructor(code, message, details = null) {
    super(message)
    this.name = 'ServiceError'
    this.code = code
    this.details = details
  }
}

export const notFound = (what = 'El contenido') => new ServiceError('not_found', `${what} no existe o ya no está disponible.`)
export const unauthenticated = () => new ServiceError('unauthenticated', 'Necesitás iniciar sesión para continuar.')
export const forbidden = (msg = 'No tenés permiso para hacer esto.') => new ServiceError('forbidden', msg)
export const invalid = (msg, details) => new ServiceError('validation', msg, details)
export const conflict = (msg) => new ServiceError('conflict', msg)
