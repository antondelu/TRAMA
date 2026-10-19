// Sesión del modo demo: solo guarda qué cuenta está activa en esta pestaña.
// No hay contraseñas ni tokens. Con autenticación real, la sesión la maneja
// el proveedor (cookie httpOnly o similar) y no este archivo.

const KEY = 'trama-demo-session'

export function getSessionUserId() {
  try {
    return sessionStorage.getItem(KEY)
  } catch {
    return null
  }
}

export function setSessionUserId(userId) {
  try {
    if (userId) sessionStorage.setItem(KEY, userId)
    else sessionStorage.removeItem(KEY)
  } catch {
    // sin almacenamiento: la sesión dura hasta recargar
  }
}
