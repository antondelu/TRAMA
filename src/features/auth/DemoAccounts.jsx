import { useState } from 'react'
import { FlaskConical } from 'lucide-react'
import { authService } from '@/services'
import { useAuth } from '@/context/AuthContext'
import { Avatar } from '@/components/ui/Avatar'

// Accesos rápidos del modo demo, para probar cada rol sin escribir datos.
export function DemoAccounts({ onDone }) {
  const { loginAsDemo } = useAuth()
  const [busy, setBusy] = useState(null)
  const accounts = authService.demoAccounts()
  return (
    <div className="rounded-[var(--radius-card)] border border-warning/30 bg-warning-soft/60 p-5">
      <h2 className="flex items-center gap-2 font-semibold text-warning"><FlaskConical aria-hidden className="size-4" />Cuentas de demostración</h2>
      <p className="mt-1 text-xs text-ink-soft">Ingreso sin contraseña, solo para probar. No es un acceso seguro.</p>
      <ul className="mt-4 space-y-2">
        {accounts.map((a) => (
          <li key={a.id}>
            <button type="button" disabled={Boolean(busy)}
              onClick={async () => { setBusy(a.id); try { await loginAsDemo(a.id); onDone() } finally { setBusy(null) } }}
              className="flex w-full items-center gap-3 rounded-lg border border-line bg-surface px-3 py-2 text-left hover:border-brand disabled:opacity-60">
              <Avatar name={a.name} size="sm" />
              <span className="min-w-0">
                <span className="block text-sm font-semibold">{a.name}{busy === a.id ? '…' : ''}</span>
                <span className="block truncate text-xs text-ink-soft">{a.label}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
