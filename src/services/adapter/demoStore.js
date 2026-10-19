// ADAPTADOR LOCAL DE DEMOSTRACIÓN.
// Guarda todas las colecciones en memoria y las copia a sessionStorage, así
// sobreviven a una recarga pero desaparecen al cerrar la pestaña. No es una
// base de datos: cada pestaña tiene su propia copia y nadie más la ve.
// Para producción, reemplazar este adaptador por llamadas a la API.

import { buildSeed } from '@/data/mock'

const KEY = 'trama-demo-data-v1'
const listeners = new Set()
let db = load()
let counter = 0

function load() {
  try {
    const raw = sessionStorage.getItem(KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    // sessionStorage bloqueado o datos corruptos: se usa la semilla.
  }
  return buildSeed()
}

export function getDb() {
  return db
}

// Guarda los cambios y avisa a las vistas para que vuelvan a pedir datos.
export function commit() {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(db))
  } catch {
    // Sin almacenamiento: los cambios duran hasta recargar.
  }
  for (const fn of listeners) fn()
}

export function subscribe(fn) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

export function resetDemoData() {
  db = buildSeed()
  commit()
}

export function newId(prefix) {
  counter += 1
  return `${prefix}-${Date.now().toString(36)}${counter.toString(36)}`
}

export function nowISO() {
  return new Date().toISOString()
}

// Latencia fija y corta para que se vean los estados de carga, como con una API.
export function latency(ms = 120) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// Las vistas reciben copias, nunca los objetos internos.
export function clone(value) {
  return value == null ? value : structuredClone(value)
}
