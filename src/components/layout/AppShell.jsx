import { useEffect } from 'react'
import { Outlet, ScrollRestoration, useLocation } from 'react-router-dom'
import { FlaskConical } from 'lucide-react'
import { PublicHeader } from './PublicHeader'
import { Footer } from './Footer'
import { APP } from '@/config/app'

function DemoBanner() {
  if (!APP.demoMode) return null
  return (
    <div className="bg-accent text-white">
      <p className="mx-auto flex max-w-7xl items-center justify-center gap-2 px-4 py-1.5 text-center text-xs font-medium">
        <FlaskConical aria-hidden className="size-3.5 shrink-0" />
        Versión de demostración: datos ficticios, sin pagos, reservas ni cuentas reales.
      </p>
    </div>
  )
}

// Mueve el foco al contenido al cambiar de página (lectores de pantalla y teclado).
function FocusOnNavigate() {
  const { pathname } = useLocation()
  useEffect(() => {
    document.getElementById('contenido')?.focus({ preventScroll: true })
  }, [pathname])
  return null
}

export function AppShell() {
  return (
    <div className="flex min-h-screen flex-col">
      <a href="#contenido" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-surface focus:px-4 focus:py-2 focus:shadow">
        Saltar al contenido
      </a>
      <DemoBanner />
      <PublicHeader />
      <main id="contenido" tabIndex={-1} className="flex-1 focus:outline-none">
        <Outlet />
      </main>
      <Footer />
      <ScrollRestoration />
      <FocusOnNavigate />
    </div>
  )
}
