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

// Íconos de Android e iOS (Simple Icons, CC0). Las insignias oficiales de las
// tiendas solo se pueden usar con la app publicada: hasta entonces, íconos simples.
const PLATFORMS = [
  { id: 'android', label: 'Android', path: 'M18.44 5.56c-.68 1.17-1.35 2.33-2.03 3.5-.04-.02-.07-.03-.11-.04-1.82-.7-3.48-.8-4.42-.79-1.86.02-3.35.46-4.26.82-.08-.15-1.75-3.02-2.02-3.49a1.15 1.15 0 0 0-.14-.19c-.33-.36-.9-.49-1.38-.2-.48.28-.71.94-.39 1.5 1.95 3.37-.1-.22 1.95 3.36.02.03-.49.26-1.39 1.02C2.9 12.18.45 14.77 0 18.99h24c-.12-1.1-.4-2.09-.77-2.97-.39-.91-.89-1.71-1.43-2.42-.94-1.24-2.08-2.22-3.22-2.92.64-1.11 1.27-2.23 1.91-3.34.2-.35.22-.78.02-1.13a1.11 1.11 0 0 0-.41-.42c-.54-.32-1.22-.1-1.54.37zM6.57 13.4a1.08 1.08 0 1 1 0 2.16 1.08 1.08 0 0 1 0-2.16zm10.85 0a1.08 1.08 0 1 1 0 2.16 1.08 1.08 0 0 1 0-2.16z' },
  { id: 'ios', label: 'iOS', path: 'M12.15 6.9c-.95 0-2.42-1.08-3.96-1.04-2.04.03-3.91 1.18-4.96 3.01-2.12 3.68-.55 9.1 1.52 12.09 1.01 1.45 2.21 3.09 3.79 3.04 1.52-.07 2.09-.99 3.94-.99 1.83 0 2.35.99 3.96.95 1.64-.03 2.68-1.48 3.68-2.95 1.16-1.69 1.64-3.33 1.66-3.42-.04-.01-3.18-1.22-3.22-4.86-.03-3.04 2.48-4.49 2.6-4.56-1.43-2.09-3.62-2.32-4.39-2.38-2-.16-3.68 1.09-4.61 1.09zM15.53 3.83c.84-1.01 1.4-2.43 1.25-3.83-1.21.05-2.66.81-3.53 1.82-.78.9-1.45 2.34-1.27 3.71 1.34.1 2.72-.69 3.56-1.7' },
]

// Apps en camino: se muestran sin enlace hasta que estén en las tiendas.
function AppsComingSoon() {
  return (
    <div className="pt-1">
      <p id="footer-apps" className="eyebrow !text-white/60">Apps · Próximamente</p>
      <ul aria-labelledby="footer-apps" className="mt-2 flex flex-wrap gap-2">
        {PLATFORMS.map((p) => (
          <li key={p.id} className="inline-flex items-center gap-1.5 border border-white/30 px-3 py-1.5 text-sm font-bold text-white/80">
            <svg aria-hidden viewBox="0 0 24 24" className="size-3.5 fill-current"><path d={p.path} /></svg>
            {p.label}
          </li>
        ))}
      </ul>
    </div>
  )
}

export function Footer() {
  return (
    <footer className="mt-auto bg-night pb-[env(safe-area-inset-bottom)] text-white/85">
      <PageContainer className="grid gap-10 py-12 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div className="space-y-4">
          <Logo inverted />
          <p className="max-w-xs text-base">{APP.descriptor}. Salas, espectáculos, servicios y recursos en un mismo lugar.</p>
          <AppsComingSoon />
        </div>
        {COLUMNS.map((col) => (
          <nav key={col.title} aria-label={col.title}>
            <h2 className="eyebrow mb-3 !text-white/60">{col.title}</h2>
            <ul className="space-y-2.5 text-base">
              {col.links.map((l) => <li key={l.to}><Link to={l.to} className="underline-offset-4 hover:text-white hover:underline">{l.label}</Link></li>)}
            </ul>
          </nav>
        ))}
      </PageContainer>
      {/* El nombre en grande cierra la página, como el pie de un cartel. */}
      <div aria-hidden className="overflow-hidden border-t border-white/15">
        <PageContainer>
          <p className="select-none font-display text-[clamp(4.5rem,19vw,15rem)] font-extrabold leading-[0.78] tracking-[-0.04em] text-white/[0.08] [font-stretch:125%]">trama</p>
        </PageContainer>
      </div>
      <div className="border-t border-white/15">
        <PageContainer className="flex flex-wrap items-center justify-between gap-2 py-4 text-sm text-white/65">
          <p>© {new Date().getFullYear()} {APP.name} · {APP.owner}. Uruguay.</p>
          <p>Desarrollado por {APP.owner}.</p>
        </PageContainer>
      </div>
    </footer>
  )
}
