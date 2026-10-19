import { useState } from 'react'
import { Search } from 'lucide-react'
import { AdminHeader } from './AdminLayout'
import { Button } from '@/components/ui/Button'
import { Badge, StatusBadge } from '@/components/ui/StatusBadge'
import { Modal } from '@/components/ui/Modal'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { DataList } from '@/components/ui/Card'
import { EmptyState, ErrorState, LoadingSkeleton } from '@/components/ui/States'
import { FormError } from '@/components/forms/FormError'
import { inputClasses } from '@/components/forms/FormField'
import { adminService } from '@/services'
import { useServiceQuery } from '@/hooks/useServiceQuery'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useToast } from '@/context/ToastContext'
import { ROLES, ASSIGNABLE_ROLES } from '@/constants/permissions'
import { formatDate } from '@/utils/format'

function UserDetail({ user, onClose }) {
  const { success } = useToast()
  const [roles, setRoles] = useState(user.roles)
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)
  const toggle = (r) => setRoles((list) => (list.includes(r) ? list.filter((x) => x !== r) : [...list, r]))

  async function save() {
    setBusy(true)
    setError(null)
    try {
      await adminService.setUserRoles(user.id, roles)
      success('Roles actualizados', `${user.firstName} ${user.lastName}`)
      onClose()
    } catch (e) {
      setError(e)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal open onClose={onClose} title={`${user.firstName} ${user.lastName}`} description={user.email}
      footer={<><Button variant="secondary" onClick={onClose}>Cerrar</Button><Button loading={busy} onClick={save}>Guardar roles</Button></>}>
      <DataList items={[
        { label: 'Estado', value: <StatusBadge status={user.status === 'active' ? 'published' : 'rejected'} label={user.status === 'active' ? 'Activa' : 'Suspendida'} /> },
        { label: 'Ciudad', value: user.city }, { label: 'Plan', value: user.plan },
        { label: 'Roles efectivos', value: user.effectiveRoles.filter((r) => ROLES[r]).map((r) => ROLES[r]) },
        { label: 'Alta', value: formatDate(user.createdAt.slice(0, 10)) },
      ]} />
      <fieldset className="mt-5 space-y-2">
        <legend className="text-sm font-semibold">Roles asignados</legend>
        <p className="text-xs text-ink-soft">Responsable de sala, compañía, profesional y miembro se calculan solos según lo que la persona tiene.</p>
        {ASSIGNABLE_ROLES.filter((r) => r !== 'user').map((r) => (
          <label key={r} className="flex items-center gap-2 text-sm">
            <input type="checkbox" className="size-4 accent-[var(--color-brand)]" checked={roles.includes(r)} onChange={() => toggle(r)} />{ROLES[r]}
          </label>
        ))}
      </fieldset>
      <div className="mt-3"><FormError error={error} /></div>
    </Modal>
  )
}

export default function AdminUsersPage() {
  useDocumentTitle('Usuarios')
  const { success, error: showError } = useToast()
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('')
  const [role, setRole] = useState('')
  const [detail, setDetail] = useState(null)
  const [toggling, setToggling] = useState(null)
  const { data, error, reload } = useServiceQuery(() => adminService.listUsers({ q, status, role }), [q, status, role])

  async function toggleStatus() {
    const next = toggling.status === 'active' ? 'suspended' : 'active'
    try {
      await adminService.setUserStatus(toggling.id, next)
      success(next === 'suspended' ? 'Cuenta suspendida' : 'Cuenta reactivada', `${toggling.firstName} ${toggling.lastName}`)
    } catch (e) {
      showError('No se pudo cambiar el estado', e.message)
    }
    setToggling(null)
  }

  return (
    <>
      <AdminHeader title="Usuarios" description="Buscar, revisar perfiles, asignar roles y suspender cuentas." />
      <div className="mb-4 flex flex-wrap gap-3">
        <div className="relative min-w-60 flex-1">
          <Search aria-hidden className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-soft" />
          <label htmlFor="user-q" className="sr-only">Buscar usuarios</label>
          <input id="user-q" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Nombre, correo o ciudad" className={`${inputClasses(false)} pl-9`} />
        </div>
        <label><span className="sr-only">Estado</span>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className={inputClasses(false)}>
            <option value="">Todos los estados</option><option value="active">Activas</option><option value="suspended">Suspendidas</option>
          </select>
        </label>
        <label><span className="sr-only">Rol</span>
          <select value={role} onChange={(e) => setRole(e.target.value)} className={inputClasses(false)}>
            <option value="">Todos los roles</option>
            {Object.entries(ROLES).filter(([id]) => id !== 'visitor').map(([id, l]) => <option key={id} value={id}>{l}</option>)}
          </select>
        </label>
      </div>
      {error ? <ErrorState error={error} onRetry={reload} /> : !data ? <LoadingSkeleton variant="list" count={4} />
        : data.length === 0 ? <EmptyState title="Sin usuarios con esos filtros" />
          : (
            <div className="overflow-x-auto rounded-[var(--radius-card)] border border-line bg-surface">
              <table className="w-full min-w-[46rem] text-sm">
                <thead className="border-b border-line bg-canvas text-left text-xs uppercase tracking-wide text-ink-soft">
                  <tr><th className="px-4 py-3">Persona</th><th className="px-4 py-3">Roles</th><th className="px-4 py-3">Plan</th><th className="px-4 py-3">Estado</th><th className="px-4 py-3 text-right">Acciones</th></tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {data.map((u) => (
                    <tr key={u.id}>
                      <td className="px-4 py-3"><span className="block font-semibold">{u.firstName} {u.lastName}</span><span className="text-xs text-ink-soft">{u.email}</span></td>
                      <td className="px-4 py-3"><div className="flex flex-wrap gap-1">{u.effectiveRoles.filter((r) => r !== 'user' && ROLES[r]).map((r) => <Badge key={r}>{ROLES[r]}</Badge>)}</div></td>
                      <td className="px-4 py-3">{u.plan}</td>
                      <td className="px-4 py-3"><StatusBadge status={u.status === 'active' ? 'published' : 'rejected'} label={u.status === 'active' ? 'Activa' : 'Suspendida'} /></td>
                      <td className="px-4 py-3"><div className="flex justify-end gap-1">
                        <Button size="sm" variant="ghost" onClick={() => setDetail(u)}>Ver perfil</Button>
                        <Button size="sm" variant="secondary" onClick={() => setToggling(u)}>{u.status === 'active' ? 'Suspender' : 'Reactivar'}</Button>
                      </div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
      {detail && <UserDetail user={detail} onClose={() => setDetail(null)} />}
      <ConfirmDialog open={Boolean(toggling)} tone={toggling?.status === 'active' ? 'danger' : 'primary'}
        title={toggling?.status === 'active' ? '¿Suspender esta cuenta?' : '¿Reactivar esta cuenta?'}
        description={toggling && `${toggling.firstName} ${toggling.lastName}. ${toggling.status === 'active' ? 'No va a poder ingresar ni usar la plataforma.' : 'Va a poder volver a ingresar.'}`}
        confirmLabel={toggling?.status === 'active' ? 'Suspender' : 'Reactivar'} onCancel={() => setToggling(null)} onConfirm={toggleStatus} />
    </>
  )
}
