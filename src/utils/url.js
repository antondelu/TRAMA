// Enlaces que cargan las personas (postulación externa, video, sitios).
// Se comprueban con URL, nunca buscando un texto adentro: `includes('example.org')`
// también acepta https://example.org.sitio-falso.com o https://malo.com/?example.org.

// La URL si es http(s); si no (javascript:, data:, texto suelto), null.
export function safeHttpUrl(value, { httpsOnly = false } = {}) {
  try {
    const url = new URL(String(value ?? ''))
    const ok = httpsOnly ? url.protocol === 'https:' : ['https:', 'http:'].includes(url.protocol)
    return ok ? url.href : null
  } catch {
    return null
  }
}

// ¿El enlace es de un dominio dado o de uno de sus subdominios?
export function isHost(value, domain) {
  const url = safeHttpUrl(value)
  if (!url) return false
  const host = new URL(url).hostname
  return host === domain || host.endsWith(`.${domain}`)
}
