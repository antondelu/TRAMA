import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { LogOut, RotateCcw } from 'lucide-react'
import { AccountHeader } from './AccountLayout'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Checkbox } from '@/components/forms/FormField'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { profilesService, resetDemoData } from '@/services'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import { useSubmit } from '@/features/inquiries/useSubmit'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useUnsavedChanges } from '@/hooks/useUnsavedChanges'

export default function SettingsPage() {
  useDocumentTitle('Configuración')
  const { user, logout } = useAuth()
  const { info } = useToast()
  const navigate = useNavigate()
  const [resetOpen, setResetOpen] = useState(false)
  const prefs = user.notificationPrefs ?? {}
  const defaults = {
    email: Boolean(prefs.email), requests: Boolean(prefs.requests), opportunities: Boolean(prefs.opportunities), messages: Boolean(prefs.messages),
    profilePublic: user.privacy?.profilePublic !== false,
  }
  const { register, handleSubmit, reset, formState: { isDirty } } = useForm({ defaultValues: defaults })
  const blocker = useUnsavedChanges(isDirty)
  const { run, submitting } = useSubmit({ successTitle: 'Preferencias guardadas' })

  return (
    <>
      <AccountHeader title="Configuración" description="Notificaciones, privacidad y sesión." />
      <form className="space-y-5" onSubmit={handleSubmit(async ({ profilePublic, ...notificationPrefs }) => {
        const saved = await run(() => profilesService.updateSettings({ notificationPrefs, privacy: { profilePublic } }))
        if (saved) reset({ profilePublic, ...notificationPrefs })
      })}>
        <Card className="space-y-3 p-5">
          <h2 className="font-semibold">Datos personales</h2>
          <p className="text-sm text-ink-soft">{user.firstName} {user.lastName} · {user.email}</p>
          <Button variant="link" to="/mi-cuenta/perfil">Editar en Perfil</Button>
        </Card>
        <Card className="space-y-3 p-5">
          <h2 className="font-semibold">Notificaciones y comunicación</h2>
          <p className="text-xs text-ink-soft">Los avisos por correo se activan cuando exista el servicio de email. Hoy solo se ven dentro de TRAMA.</p>
          <Checkbox label="Recibir avisos por correo electrónico" {...register('email')} />
          <Checkbox label="Solicitudes nuevas y respuestas" {...register('requests')} />
          <Checkbox label="Convocatorias por cerrar de mis favoritos" {...register('opportunities')} />
          <Checkbox label="Mensajes nuevos" {...register('messages')} />
        </Card>
        <Card className="space-y-3 p-5">
          <h2 className="font-semibold">Privacidad del perfil</h2>
          <Checkbox label="Perfil público (tu nombre, ciudad y biografía se pueden ver junto a tus publicaciones)" {...register('profilePublic')} />
        </Card>
        <div className="flex justify-end"><Button type="submit" loading={submitting} disabled={!isDirty}>Guardar preferencias</Button></div>
      </form>
      <Card className="mt-5 space-y-3 p-5">
        <h2 className="font-semibold">Membresía</h2>
        <p className="text-sm">{user.plan ? `Plan ${user.plan.name}` : 'Plan Comunidad (gratis)'}</p>
        <Button variant="link" to="/mi-cuenta/membresia">Gestionar membresía</Button>
      </Card>
      <Card className="mt-5 flex flex-wrap gap-2 p-5">
        <Button variant="secondary" icon={LogOut} onClick={async () => { await logout(); info('Cerraste sesión'); navigate('/') }}>Cerrar sesión</Button>
        <Button variant="ghost" icon={RotateCcw} onClick={() => setResetOpen(true)}>Restablecer datos de la demo</Button>
      </Card>
      <ConfirmDialog open={resetOpen} title="¿Restablecer la demo?" description="Se borran todos los cambios que hiciste en esta pestaña y se cierra la sesión."
        confirmLabel="Restablecer" onCancel={() => setResetOpen(false)}
        onConfirm={async () => { await logout(); resetDemoData(); setResetOpen(false); navigate('/') }} />
      <ConfirmDialog open={blocker.state === 'blocked'} title="¿Salir sin guardar?" description="Cambiaste preferencias que no guardaste."
        confirmLabel="Salir sin guardar" cancelLabel="Seguir editando" onConfirm={() => blocker.proceed?.()} onCancel={() => blocker.reset?.()} />
    </>
  )
}
