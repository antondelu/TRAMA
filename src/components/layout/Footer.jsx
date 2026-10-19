import { Link } from 'react-router-dom'
import { Logo } from '@/components/navigation/Logo'
import { PageContainer } from './PageContainer'
import { CATEGORIES, OPPORTUNITIES_NAV, NEWS_NAV } from '@/constants/navigation'
import { APP } from '@/config/app'

const COLUMNS = [
  { title: 'Explorar', links: [...CATEGORIES, OPPORTUNITIES_NAV, NEWS_NAV].map((c) => ({ to: c.to, label: c.label })) },
  { title: 'TRAMA', links: [{ to: '/como-funciona', label: 'Cómo funciona' }, { to: '/nosotros', label: 'Nosotros' }, { to: '/planes', label: 'Membresías' }, { to: '/publicar', label: 'Publicar' }] },
  { title: 'Ayuda', links: [{ to: '/contacto', label: 'Contacto' }, { to: '/terminos', label: 'Términos y condiciones' }, { to: '/privacidad', label: 'Política de privacidad' }] },
]

export function Footer() {
  return (
    <footer className="mt-auto bg-brand-strong text-white/80">
      <PageContainer className="grid gap-10 py-12 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div className="space-y-3">
          <Logo inverted />
          <p className="max-w-xs text-sm">{APP.descriptor}. Salas, espectáculos, servicios y recursos en un mismo lugar.</p>
          {/* Redes sociales: no se muestran perfiles hasta que existan cuentas oficiales. */}
          <p className="text-xs text-white/50">Redes sociales: próximamente.</p>
        </div>
        {COLUMNS.map((col) => (
          <nav key={col.title} aria-label={col.title}>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-white/50">{col.title}</h2>
            <ul className="space-y-2 text-sm">
              {col.links.map((l) => <li key={l.to}><Link to={l.to} className="hover:text-white hover:underline">{l.label}</Link></li>)}
            </ul>
          </nav>
        ))}
      </PageContainer>
      <div className="border-t border-white/10">
        <PageContainer className="flex flex-wrap items-center justify-between gap-2 py-4 text-xs text-white/50">
          <p>© {new Date().getFullYear()} TRAMA. Uruguay.</p>
          {APP.demoMode && <p>Entorno de demostración: todos los datos son ficticios.</p>}
        </PageContainer>
      </div>
    </footer>
  )
}
