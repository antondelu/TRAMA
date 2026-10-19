import { Link } from 'react-router-dom'
import { Megaphone, Drama, Wrench, Building2, ArrowRight } from 'lucide-react'
import { PageContainer } from '@/components/layout/PageContainer'

const OPTIONS = [
  { to: '/oportunidades', label: 'Explorar oportunidades', icon: Megaphone, text: 'Convocatorias, residencias y festivales abiertos.' },
  { to: '/publicar/espectaculo', label: 'Publicar un espectáculo', icon: Drama, text: 'Que salas y festivales encuentren tu obra.' },
  { to: '/publicar/servicio', label: 'Ofrecer servicios', icon: Wrench, text: 'Sumá tu perfil al directorio profesional.' },
  { to: '/publicar/sala', label: 'Registrar una sala', icon: Building2, text: 'Mostrá tu espacio, su ficha técnica y su calendario.' },
]

export function JoinSection() {
  return (
    <section aria-labelledby="join-title" className="bg-brand text-white">
      <PageContainer className="py-16 sm:py-24">
        <h2 id="join-title" className="font-serif text-4xl font-semibold tracking-tight sm:text-5xl">Formá parte de la red.</h2>
        <p className="mt-3 max-w-xl text-white/80">TRAMA crece con cada sala, obra y profesional que se suma. Publicar es gratis.</p>
        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {OPTIONS.map(({ to, label, icon: Icon, text }) => (
            <li key={to}>
              <Link to={to} className="group flex h-full flex-col rounded-[var(--radius-card)] border border-white/20 bg-white/5 p-5 transition-colors hover:bg-white/10">
                <Icon aria-hidden className="size-6 text-white/80" />
                <span className="mt-4 flex items-center gap-1 font-semibold">{label}<ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-0.5" /></span>
                <span className="mt-1 text-sm text-white/70">{text}</span>
              </Link>
            </li>
          ))}
        </ul>
      </PageContainer>
    </section>
  )
}
