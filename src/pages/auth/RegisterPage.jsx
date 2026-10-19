import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { Controller, useForm } from 'react-hook-form'
import { AuthLayout } from './AuthLayout'
import { FormField, Input, Select, CheckboxGroup, Checkbox } from '@/components/forms/FormField'
import { FormError } from '@/components/forms/FormError'
import { PasswordInput } from '@/features/auth/PasswordInput'
import { registerResolver } from '@/features/auth/schemas'
import { Button } from '@/components/ui/Button'
import { DemoNotice } from '@/components/ui/DemoNotice'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import { useTaxonomies } from '@/hooks/useTaxonomies'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { configService } from '@/services'
import { PASSWORD_POLICY } from '@/config/app'

export default function RegisterPage() {
  useDocumentTitle('Crear cuenta')
  const { user, register: registerUser } = useAuth()
  const { success } = useToast()
  const { tax } = useTaxonomies()
  const navigate = useNavigate()
  const [error, setError] = useState(null)
  const countries = configService.countries()
  const { register, control, handleSubmit, watch, setError: setFieldError, formState: { errors, isSubmitting } } = useForm({
    resolver: registerResolver,
    defaultValues: { country: 'UY', city: '', interests: [], acceptTerms: false },
  })
  const country = countries.find((c) => c.code === watch('country'))

  if (user) return <Navigate to="/mi-cuenta" replace />

  async function onSubmit(data) {
    setError(null)
    try {
      await registerUser(data)
      success('¡Bienvenida/o a TRAMA!', 'Tu cuenta de demostración está lista.')
      navigate('/mi-cuenta', { replace: true })
    } catch (e) {
      if (e.details?.email) setFieldError('email', { message: e.details.email })
      else setError(e)
    }
  }

  return (
    <AuthLayout title="Crear cuenta" description="Es gratis. Con tu cuenta podés guardar favoritos, publicar y enviar solicitudes.">
      <form noValidate onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField label="Nombre" required error={errors.firstName?.message}><Input autoComplete="given-name" {...register('firstName')} /></FormField>
          <FormField label="Apellido" required error={errors.lastName?.message}><Input autoComplete="family-name" {...register('lastName')} /></FormField>
        </div>
        <FormField label="Correo electrónico" required error={errors.email?.message}><Input type="email" autoComplete="email" {...register('email')} /></FormField>
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField label="Contraseña" required hint={PASSWORD_POLICY.description} error={errors.password?.message}><PasswordInput autoComplete="new-password" {...register('password')} /></FormField>
          <FormField label="Repetir contraseña" required error={errors.confirmPassword?.message}><PasswordInput autoComplete="new-password" {...register('confirmPassword')} /></FormField>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField label="País" required error={errors.country?.message}><Select options={countries.map((c) => ({ id: c.code, label: c.name }))} {...register('country')} /></FormField>
          <FormField label="Ciudad" required error={errors.city?.message}>
            <Select placeholder="Elegí tu ciudad" options={(country?.cities ?? []).map((c) => ({ id: c.name, label: c.name }))} {...register('city')} />
          </FormField>
        </div>
        <Controller control={control} name="interests" render={({ field }) => (
          <CheckboxGroup legend="¿Qué te interesa?" hint="Opcional. Solo ordena lo que ves primero: tenés acceso a todo." columns={2}
            options={tax.interests} value={field.value} onChange={field.onChange} />
        )} />
        <Checkbox error={errors.acceptTerms?.message} {...register('acceptTerms')}
          label={<>Acepto los <Link to="/terminos" target="_blank" className="font-semibold text-brand underline">términos y condiciones</Link> y la <Link to="/privacidad" target="_blank" className="font-semibold text-brand underline">política de privacidad</Link>.</>} />
        <FormError error={error} />
        <DemoNotice>Modo demo: la cuenta vive solo en esta pestaña y la contraseña no se guarda.</DemoNotice>
        <Button type="submit" size="lg" className="w-full" loading={isSubmitting}>Crear cuenta</Button>
        <p className="text-center text-sm text-ink-soft">¿Ya tenés cuenta? <Link to="/ingresar" className="font-semibold text-brand hover:underline">Ingresá</Link></p>
      </form>
    </AuthLayout>
  )
}
