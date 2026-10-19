import { Link } from 'react-router-dom'
import { Logo } from '@/components/navigation/Logo'
import { PageContainer } from './PageContainer'
import { CATEGORIES, OPPORTUNITIES_NAV } from '@/constants/navigation'
import { APP } from '@/config/app'
import { cn } from '@/utils/format'

const COLUMNS = [
  { title: 'Explorar', links: [...CATEGORIES, OPPORTUNITIES_NAV].map((c) => ({ to: c.to, label: c.label })) },
  { title: 'TRAMA', links: [{ to: '/como-funciona', label: 'Cómo funciona' }, { to: '/nosotros', label: 'Nosotros' }, { to: '/planes', label: 'Membresías' }, { to: '/publicar', label: 'Publicar' }] },
  { title: 'Ayuda', links: [{ to: '/contacto', label: 'Contacto' }, { to: '/terminos', label: 'Términos y condiciones' }, { to: '/privacidad', label: 'Política de privacidad' }] },
]

// Telones atados: una cortina bordó a cada costado, recogida a media altura con un lazo,
// como en la boca de un escenario. Se dibuja la izquierda y la derecha es su espejo.
// Las franjas repetidas del degradé simulan los pliegues de la tela.
function Curtain({ side }) {
  const id = `curtain-folds-${side}`
  return (
    <svg aria-hidden="true" viewBox="0 0 100 400" preserveAspectRatio="none"
      className={cn('absolute inset-y-0 hidden h-full w-20 lg:block', side === 'left' ? 'left-0' : 'right-0 -scale-x-100')}>
      <defs>
        <linearGradient id={id} x1="0" x2="0.34" y1="0" y2="0" spreadMethod="repeat">
          <stop offset="0" stopColor="var(--color-curtain-strong)" />
          <stop offset="0.5" stopColor="var(--color-curtain)" />
          <stop offset="1" stopColor="var(--color-curtain-strong)" />
        </linearGradient>
      </defs>
      <path d="M0 0H100C100 90 34 170 24 210C34 255 78 330 70 400H0Z" fill={`url(#${id})`} />
      <path d="M100 0C100 90 34 170 24 210C34 255 78 330 70 400" fill="none" stroke="rgb(0 0 0 / 0.3)" strokeWidth="3" />
      <rect x="0" y="202" width="34" height="14" rx="7" fill="var(--color-curtain-tie)" />
      <path d="M26 214L32 246H20Z" fill="var(--color-curtain-tie)" />
    </svg>
  )
}

export function Footer() {
  return (
    <footer className="relative mt-auto bg-brand-strong text-white/80 lg:px-20">
      <Curtain side="left" />
      <Curtain side="right" />
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
          <p>© {new Date().getFullYear()} {APP.name} · {APP.owner}. Uruguay.</p>
          <p>Desarrollado por {APP.owner}.</p>
          {APP.demoMode && <p className="basis-full">Entorno de demostración: todos los datos son ficticios.</p>}
        </PageContainer>
      </div>
    </footer>
  )
}
