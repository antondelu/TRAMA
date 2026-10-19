import { AlertCircle } from 'lucide-react'

// Error general de un formulario (lo que no corresponde a un campo).
export function FormError({ error }) {
  if (!error) return null
  return (
    <p role="alert" className="flex items-start gap-2 rounded-lg border border-danger/25 bg-danger-soft px-3 py-2 text-sm text-danger">
      <AlertCircle aria-hidden className="mt-0.5 size-4 shrink-0" />
      {error.message ?? String(error)}
    </p>
  )
}
