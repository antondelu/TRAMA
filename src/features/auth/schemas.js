import { z } from 'zod'
import { PASSWORD_POLICY } from '@/config/app'
import { resolverWithChecks } from '@/utils/validation'

export const passwordSchema = z.string()
  .min(PASSWORD_POLICY.minLength, `Mínimo ${PASSWORD_POLICY.minLength} caracteres`)
  .regex(/[A-Za-zÁÉÍÓÚáéíóúÑñ]/, 'Tiene que tener al menos una letra')
  .regex(/\d/, 'Tiene que tener al menos un número')

export const registerSchema = z.object({
  firstName: z.string().trim().min(1, 'Escribí tu nombre').max(60, 'Máximo 60 caracteres'),
  lastName: z.string().trim().min(1, 'Escribí tu apellido').max(60, 'Máximo 60 caracteres'),
  email: z.string().trim().min(1, 'Escribí tu correo').email('Revisá el formato del correo'),
  password: passwordSchema,
  confirmPassword: z.string().min(1, 'Repetí la contraseña'),
  country: z.string().min(1, 'Elegí tu país'),
  city: z.string().min(1, 'Elegí tu ciudad'),
  interests: z.array(z.string()).default([]),
  acceptTerms: z.literal(true, { errorMap: () => ({ message: 'Tenés que aceptar los términos y la política de privacidad' }) }),
})

export const registerResolver = resolverWithChecks(registerSchema, [
  (v) => (v.confirmPassword && v.password !== v.confirmPassword ? { path: 'confirmPassword', message: 'Las contraseñas no coinciden' } : null),
])
