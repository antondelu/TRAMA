import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { MailCheck } from 'lucide-react'
import { AuthLayout } from './AuthLayout'
import { FormField, Input } from '@/components/forms/FormField'
import { Button } from '@/components/ui/Button'
import { DemoNotice } from '@/components/ui/DemoNotice'
import { authService } from '@/services'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

const schema = z.object({ email: z.string().trim().min(1, 'Escribí tu correo').email('Revisá el formato del correo') })

export default function RecoverPasswordPage() {
  useDocumentTitle('Recuperar contraseña')
  const [done, setDone] = useState(false)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(schema) })

  return (
    <AuthLayout title="Recuperar contraseña" description="Te enviamos un enlace para crear una contraseña nueva.">
      {done ? (
        <div role="status" className="space-y-4 rounded-[var(--radius-card)] border border-line bg-surface p-6">
          <MailCheck aria-hidden className="size-8 text-accent" />
          <p>Si existe una cuenta con ese correo, vas a recibir un enlace para recuperar el acceso.</p>
          <DemoNotice>Modo demo: no se envió ningún correo. La recuperación real necesita un proveedor de autenticación y de email.</DemoNotice>
          <Button variant="secondary" to="/ingresar">Volver a ingresar</Button>
        </div>
      ) : (
        <form noValidate onSubmit={handleSubmit(async ({ email }) => { await authService.requestPasswordReset(email); setDone(true) })} className="space-y-5">
          <FormField label="Correo electrónico" required error={errors.email?.message}><Input type="email" autoComplete="email" {...register('email')} /></FormField>
          <Button type="submit" size="lg" className="w-full" loading={isSubmitting}>Enviar enlace</Button>
          <p className="text-center text-sm"><Link to="/ingresar" className="font-semibold text-brand hover:underline">Volver a ingresar</Link></p>
        </form>
      )}
    </AuthLayout>
  )
}
