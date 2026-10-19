import { useState } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { AuthLayout, safeReturnPath } from './AuthLayout'
import { FormField, Input } from '@/components/forms/FormField'
import { FormError } from '@/components/forms/FormError'
import { PasswordInput } from '@/features/auth/PasswordInput'
import { DemoAccounts } from '@/features/auth/DemoAccounts'
import { Button } from '@/components/ui/Button'
import { DemoNotice } from '@/components/ui/DemoNotice'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

const schema = z.object({
  email: z.string().trim().min(1, 'Escribí tu correo').email('Revisá el formato del correo'),
  password: z.string().min(1, 'Escribí tu contraseña'),
})

export default function LoginPage() {
  useDocumentTitle('Ingresar')
  const { user, login } = useAuth()
  const { success } = useToast()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const next = safeReturnPath(params.get('volver'))
  const [error, setError] = useState(null)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(schema) })

  if (user) return <Navigate to={next} replace />

  const done = () => {
    success('Ingresaste a TRAMA')
    navigate(next, { replace: true })
  }

  async function onSubmit({ email, password }) {
    setError(null)
    try {
      await login(email, password)
      done()
    } catch (e) {
      setError(e)
    }
  }

  return (
    <AuthLayout title="Ingresar" description="Accedé a tu cuenta para guardar favoritos, publicar y gestionar solicitudes."
      aside={<DemoAccounts onDone={done} />}>
      <form noValidate onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <FormField label="Correo electrónico" required error={errors.email?.message}><Input type="email" autoComplete="email" {...register('email')} /></FormField>
        <FormField label="Contraseña" required error={errors.password?.message}><PasswordInput autoComplete="current-password" {...register('password')} /></FormField>
        <div className="flex justify-end text-sm">
          <Link to="/recuperar-contrasena" className="font-semibold text-brand hover:underline">Olvidé mi contraseña</Link>
        </div>
        <FormError error={error} />
        <DemoNotice>Modo demo: la contraseña no se verifica ni se guarda. &quot;Recordar sesión&quot; no está disponible: la sesión dura hasta cerrar la pestaña.</DemoNotice>
        <Button type="submit" size="lg" className="w-full" loading={isSubmitting}>Ingresar</Button>
        <p className="text-center text-sm text-ink-soft">¿No tenés cuenta? <Link to="/registro" className="font-semibold text-brand hover:underline">Registrate gratis</Link></p>
      </form>
    </AuthLayout>
  )
}
