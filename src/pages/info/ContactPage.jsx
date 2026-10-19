import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { CheckCircle2 } from 'lucide-react'
import { PageHeader, PageContainer } from '@/components/layout/PageContainer'
import { FormField, Input, Textarea, Select } from '@/components/forms/FormField'
import { FormError } from '@/components/forms/FormError'
import { Button } from '@/components/ui/Button'
import { contactService } from '@/services'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useAuth } from '@/context/AuthContext'

const schema = z.object({
  name: z.string().trim().min(2, 'Escribí tu nombre').max(100, 'Máximo 100 caracteres'),
  email: z.string().trim().email('Revisá el formato del correo'),
  company: z.string().trim().max(150, 'Máximo 150 caracteres').optional(),
  msg: z.string().trim().min(10, 'Contanos un poco más (mínimo 10 caracteres)').max(5000, 'Máximo 5000 caracteres'),
  answer: z.string().min(1, 'Respondé la pregunta de verificación'),
  website: z.string().optional(), // campo trampa para bots
})

export default function ContactPage() {
  useDocumentTitle('Contacto')
  const { user } = useAuth()
  const [challenge, setChallenge] = useState(null)
  const [challengeError, setChallengeError] = useState(null)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState(null)
  const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { name: user ? `${user.firstName} ${user.lastName}` : '', email: user?.email ?? '', company: '', msg: '', answer: '', website: '' },
  })

  async function loadChallenge() {
    setChallengeError(null)
    setValue('answer', '')
    try { setChallenge(await contactService.getChallenge()) } catch (e) { setChallengeError(e) }
  }
  useEffect(() => { loadChallenge() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function onSubmit(data) {
    setError(null)
    try {
      await contactService.send({ ...data, challenge: challenge?.token })
      setSent(true)
      reset()
    } catch (e) {
      setError(e)
      loadChallenge()
    }
  }

  return (
    <>
      <PageHeader eyebrow="Contacto" title="Hablemos."
        description="Consultas sobre la plataforma, propuestas de alianza o problemas con tu cuenta."
        breadcrumbs={[{ label: 'Inicio', to: '/' }, { label: 'Contacto' }]} />
      <PageContainer narrow className="py-10">
        {sent ? (
          <div role="status" className="rounded-[var(--radius-card)] border border-success/30 bg-success-soft p-8 text-center">
            <CheckCircle2 aria-hidden className="mx-auto size-8 text-success" />
            <h2 className="mt-3 font-serif text-2xl font-semibold">Mensaje enviado</h2>
            <p className="mt-1 text-sm">Te respondemos al correo que nos dejaste.</p>
            <Button variant="secondary" className="mt-5" onClick={() => { setSent(false); loadChallenge() }}>Enviar otro mensaje</Button>
          </div>
        ) : (
          <form noValidate onSubmit={handleSubmit(onSubmit)} className="space-y-5 rounded-[var(--radius-card)] border border-line bg-surface p-6 sm:p-8">
            <div className="grid gap-5 sm:grid-cols-2">
              <FormField label="Nombre" required error={errors.name?.message}><Input autoComplete="name" {...register('name')} /></FormField>
              <FormField label="Correo electrónico" required error={errors.email?.message}><Input type="email" autoComplete="email" {...register('email')} /></FormField>
            </div>
            <FormField label="Organización" hint="Opcional" error={errors.company?.message}><Input autoComplete="organization" {...register('company')} /></FormField>
            <FormField label="Mensaje" required error={errors.msg?.message}><Textarea rows={6} {...register('msg')} /></FormField>
            {/* Oculto para personas: solo los bots lo completan. */}
            <div aria-hidden className="absolute -left-[9999px]"><label>Sitio web<input tabIndex={-1} autoComplete="off" {...register('website')} /></label></div>
            {challenge ? (
              <FormField label={`Verificación: ¿cuál es el número más grande? ${challenge.numbers.join(', ')}`} required error={errors.answer?.message}>
                <Select placeholder="Elegí uno" options={challenge.numbers.map((n) => ({ id: String(n), label: String(n) }))} {...register('answer')} />
              </FormField>
            ) : challengeError ? (
              <div className="space-y-2">
                <FormError error={challengeError} />
                <p className="text-xs text-ink-soft">El formulario necesita la API de contacto (npm run dev:api). Ver README.</p>
                <Button variant="secondary" size="sm" onClick={loadChallenge}>Reintentar</Button>
              </div>
            ) : <p className="text-sm text-ink-soft">Cargando verificación…</p>}
            <FormError error={error} />
            <Button type="submit" loading={isSubmitting} disabled={!challenge}>Enviar mensaje</Button>
          </form>
        )}
      </PageContainer>
    </>
  )
}
