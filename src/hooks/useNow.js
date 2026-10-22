import { useEffect, useState } from 'react'

// Hora actual que se actualiza sola (por defecto, cada minuto). Sirve para
// textos como "empieza en 20 min" sin recargar la página.
export function useNow(intervalMs = 60_000) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs)
    return () => clearInterval(id)
  }, [intervalMs])
  return now
}
