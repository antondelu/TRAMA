import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { Toast } from '@/components/ui/Toast'

const ToastContext = createContext(null)
let nextId = 1

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const dismiss = useCallback((id) => setToasts((list) => list.filter((t) => t.id !== id)), [])

  const toast = useCallback(({ title, description = '', tone = 'success', duration = 5000 }) => {
    const id = nextId++
    setToasts((list) => [...list.slice(-3), { id, title, description, tone }])
    if (duration) setTimeout(() => dismiss(id), duration)
  }, [dismiss])

  const value = useMemo(() => ({
    toast,
    success: (title, description) => toast({ title, description, tone: 'success' }),
    error: (title, description) => toast({ title, description, tone: 'danger', duration: 8000 }),
    info: (title, description) => toast({ title, description, tone: 'info' }),
  }), [toast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* aria-live: los lectores de pantalla anuncian cada aviso */}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-0 z-[60] flex flex-col items-center gap-2 p-4 sm:items-end">
        {toasts.map((t) => <Toast key={t.id} {...t} onDismiss={() => dismiss(t.id)} />)}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast debe usarse dentro de ToastProvider')
  return ctx
}
