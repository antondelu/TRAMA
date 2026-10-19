import { Link } from 'react-router-dom'
import { Megaphone, Drama, Wrench, Building2, ArrowUpRight } from 'lucide-react'
import { PageContainer } from '@/components/layout/PageContainer'

const OPTIONS = [
  { to: '/oportunidades', label: 'Explorar oportunidades', icon: Megaphone, text: 'Convocatorias, residencias y festivales abiertos.' },
  { to: '/publicar/espectaculo', label: 'Publicar un espectáculo', icon: Drama, text: 'Que salas y festivales encuentren tu obra.' },
  { to: '/publicar/servicio', label: 'Ofrecer servicios', icon: Wrench, text: 'Sumá tu perfil al directorio profesional.' },
  { to: '/publicar/sala', label: 'Registrar una sala', icon: Building2, text: 'Mostrá tu espacio, su ficha técnica y su calendario.' },
]

export function JoinSection() {
  return (
    <section aria-labelledby="join-title" className="py-12 sm:py-16">
      <PageContainer>
        <div className="relative overflow-hidden rounded-[2rem] bg-brand px-6 py-12 text-white sm:px-12 sm:py-16">
          <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 size-80 rounded-full bg-accent/50 blur-3xl" />
          <div aria-hidden className="pointer-events-none absolute -bottom-32 left-1/3 size-72 rounded-full bg-accent-strong/60 blur-3xl" />
          <div className="relative">
            <h2 id="join-title" className="font-display text-4xl font-bold tracking-tight sm:text-6xl">Formá parte de la red.</h2>
            <p className="mt-3 max-w-xl text-lg text-white/75">TRAMA crece con cada sala, obra y profesional que se suma. Publicar es gratis.</p>
            <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {OPTIONS.map(({ to, label, icon: Icon, text }) => (
                <li key={to}>
                  <Link to={to} className="group flex h-full flex-col rounded-[var(--radius-card)] bg-white/10 p-5 backdrop-blur-sm transition-colors hover:bg-white hover:text-brand">
                    <span className="flex items-center justify-between">
                      <Icon aria-hidden className="size-6" strokeWidth={1.75} />
                      <ArrowUpRight aria-hidden className="size-5 opacity-60 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </span>
                    <span className="mt-6 font-semibold">{label}</span>
                    <span className="mt-1 text-sm opacity-70">{text}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </PageContainer>
    </section>
  )
}
