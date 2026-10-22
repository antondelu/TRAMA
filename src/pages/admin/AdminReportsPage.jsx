import { AdminHeader } from './AdminLayout'
import { DemoNotice } from '@/components/ui/DemoNotice'
import { ErrorState, LoadingSkeleton } from '@/components/ui/States'
import { adminService } from '@/services'
import { useServiceQuery } from '@/hooks/useServiceQuery'
import { useTaxonomies } from '@/hooks/useTaxonomies'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { REQUEST_STATE_LABELS, PUBLICATION_STATES } from '@/utils/workflows'
import { formatShortDate } from '@/utils/format'

// Barras simples en HTML/CSS: con estos volúmenes no hace falta una librería de gráficos.
function BarList({ title, data, labelFor = (k) => k }) {
  const entries = Object.entries(data).sort((a, b) => b[1] - a[1])
  const max = Math.max(1, ...entries.map(([, v]) => v))
  return (
    <section className="rounded-[var(--radius-card)] border border-line bg-surface p-5" aria-label={title}>
      <h2 className="mb-4 font-semibold">{title}</h2>
      {entries.length === 0 ? <p className="text-sm text-ink-soft">Sin datos.</p> : (
        <ul className="space-y-2.5">
          {entries.map(([key, value]) => (
            <li key={key} className="grid grid-cols-[8rem_1fr_2rem] items-center gap-3 text-sm sm:grid-cols-[10rem_1fr_2rem]">
              <span className="truncate text-ink-soft" title={labelFor(key)}>{labelFor(key)}</span>
              <span className="h-2.5 overflow-hidden bg-ink/5"><span className="block h-full bg-accent" style={{ width: `${(value / max) * 100}%` }} /></span>
              <span className="text-right font-semibold tabular-nums">{value}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

const PLAN_NAMES = { 'plan-miembro': 'Miembro', 'plan-profesional': 'Profesional' }

export default function AdminReportsPage() {
  useDocumentTitle('Reportes')
  const { label } = useTaxonomies()
  const { data, error, reload } = useServiceQuery(() => adminService.reports(), [])
  if (error) return <ErrorState error={error} onRetry={reload} />
  if (!data) return <LoadingSkeleton variant="list" count={4} />
  const stateLabel = (k) => REQUEST_STATE_LABELS[k] ?? k
  return (
    <>
      <AdminHeader title="Reportes y métricas" description="Distribución de la actividad en la plataforma." />
      <DemoNotice className="mb-6">Cifras de demostración calculadas con los datos ficticios.</DemoNotice>
      <div className="grid gap-4 lg:grid-cols-2">
        <BarList title="Salas publicadas por departamento" data={data.venuesByDepartment} />
        <BarList title="Espectáculos por disciplina" data={data.showsByDiscipline} labelFor={(k) => label('disciplines', k)} />
        <BarList title="Solicitudes de reserva por estado" data={data.bookingsByStatus} labelFor={stateLabel} />
        <BarList title="Postulaciones por estado" data={data.applicationsByStatus} labelFor={stateLabel} />
        <BarList title="Consultas de contratación por estado" data={data.inquiriesByStatus} labelFor={stateLabel} />
        <BarList title="Membresías activas por plan" data={data.membershipsByPlan} labelFor={(k) => PLAN_NAMES[k] ?? k} />
      </div>
      <section className="mt-6 rounded-[var(--radius-card)] border border-line bg-surface p-5">
        <h2 className="mb-3 font-semibold">Registro de acciones (sesión actual)</h2>
        {data.auditLog.length === 0 ? <p className="text-sm text-ink-soft">Todavía no hubo acciones de moderación o administración en esta sesión.</p> : (
          <ul className="space-y-1.5 text-sm">
            {data.auditLog.map((l) => (
              <li key={l.id} className="text-ink-soft">
                {formatShortDate(l.at.slice(0, 10))} · {l.entityType} {l.entityId} · {l.action ?? `${PUBLICATION_STATES[l.from] ?? l.from} → ${PUBLICATION_STATES[l.to] ?? l.to}`}{l.note ? ` — ${l.note}` : ''}
              </li>
            ))}
          </ul>
        )}
        <p className="mt-3 text-xs text-ink-soft">En producción, la auditoría tiene que guardarse en el servidor y no poder modificarse.</p>
      </section>
    </>
  )
}
