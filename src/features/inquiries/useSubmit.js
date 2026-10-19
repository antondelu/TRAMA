import { useState } from 'react'
import { useToast } from '@/context/ToastContext'

// Envío de formularios con estado de carga, error visible y aviso de éxito.
// Mientras envía, `submitting` deshabilita el botón (evita envíos dobles).
export function useSubmit({ onSuccess, successTitle, successText }) {
  const { success } = useToast()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  async function run(fn) {
    if (submitting) return
    setSubmitting(true)
    setError(null)
    try {
      const result = await fn()
      if (successTitle) success(successTitle, successText)
      onSuccess?.(result)
      return result
    } catch (err) {
      setError(err)
      return undefined
    } finally {
      setSubmitting(false)
    }
  }

  return { run, submitting, error, setError }
}
