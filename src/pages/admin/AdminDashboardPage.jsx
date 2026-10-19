import { Link } from 'react-router-dom'
import { Users, Building2, Drama, Wrench, Megaphone, BookOpen, ShieldCheck, BadgeDollarSign } from 'lucide-react'
import { AdminHeader } from './AdminLayout'
import { DemoNotice } from '@/components/ui/DemoNotice'
import { ErrorState, LoadingSkeleton } from '@/components/ui/States'
import { adminService } from '@/services'
import { useServiceQuery } from '@/hooks/useServiceQuery'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useAuth } from '@/context/AuthContext'

export default function AdminDashboardPage() {
  useDocumentTitle('Administración')
  const { can } = useAuth()
  const { data, error, reload } = useServiceQuery(() => adminService.stats(), [])
  if (error) return <ErrorState error={error} onRetry={reload} />
  if (!data) return <LoadingSkeleton variant="list" count={3} />
  const stats = [
    { label: 'Usuarios registrados', value: data.users, sub: `${data.activeUsers} activos`, icon: Users, to: can('admin:users') && '/admin/usuarios' },
    { label: 'Salas publicadas', value: data.venues, icon: Building2, to: '/salas' },
    { label: 'Espectáculos publicados', value: data.shows, icon: Drama, to: '/espectaculos' },
    { label: 'Profesionales publicados', value: data.professionals, icon: Wrench, to: '/servicios' },
    { label: 'Convocatorias activas', value: data.openOpportunities, icon: Megaphone, to: can('admin:moderate') && '/admin/oportunidades' },
    { label: 'Recursos publicados', value: data.resources, icon: BookOpen, to: can('resources:manage') && '/admin/recursos' },
    { label: 'Pendientes de moderación', value: data.pendingModeration, icon: ShieldCheck, to: can('admin:moderate') && '/admin/publicaciones', highlight: data.pendingModeration > 0 },
    { label: 'Membresías activas', value: data.activeMemberships, icon: BadgeDollarSign, to: can('admin:plans') && '/admin/membresias' },
  ]
  return (
    <>
      <AdminHeader title="Resumen" description="Métricas calculadas a partir de los datos actuales." />
      <DemoNotice className="mb-6">Cifras de demostración: salen de los datos ficticios de esta pestaña.</DemoNotice>
      <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, sub, icon: Icon, to, highlight }) => {
          const inner = (
            <>
              <Icon aria-hidden className={highlight ? 'size-5 text-warning' : 'size-5 text-accent'} />
              <p className="mt-3 font-serif text-4xl font-semibold">{value}</p>
              <p className="text-sm text-ink-soft">{label}</p>
              {sub && <p className="text-xs text-ink-soft">{sub}</p>}
            </>
          )
          const cls = `block h-full rounded-[var(--radius-card)] border bg-surface p-5 ${highlight ? 'border-warning/40' : 'border-line'}`
          return <li key={label}>{to ? <Link to={to} className={`${cls} hover:shadow-[var(--shadow-card)]`}>{inner}</Link> : <div className={cls}>{inner}</div>}</li>
        })}
      </ul>
    </>
  )
}
