import { useEffect } from 'react'

export function useDocumentTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} · TRAMA` : 'TRAMA — Mercado profesional de las artes escénicas'
  }, [title])
}
