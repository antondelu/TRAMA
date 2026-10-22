import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Breadcrumbs, PageContainer } from '@/components/layout/PageContainer'
import { FormField, Input, Textarea, Select } from '@/components/forms/FormField'
import { FormError } from '@/components/forms/FormError'
import { Button } from '@/components/ui/Button'
import { contactService } from '@/services'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useAuth } from '@/context/AuthContext'
import { cn } from '@/utils/format'

const schema = z.object({
  name: z.string().trim().min(2, 'Escribí tu nombre').max(100, 'Máximo 100 caracteres'),
  email: z.string().trim().email('Revisá el formato del correo'),
  company: z.string().trim().max(150, 'Máximo 150 caracteres').optional(),
  msg: z.string().trim().min(10, 'Contanos un poco más (mínimo 10 caracteres)').max(5000, 'Máximo 5000 caracteres'),
  answer: z.string().min(1, 'Respondé la pregunta de verificación'),
  website: z.string().optional(), // campo trampa para bots
})

// "¿Qué te trae por acá?": el tema elegido orienta el mensaje y viaja al
// principio del texto (la API no tiene campo de asunto). ?tema=<id> lo preselecciona.
const TOPICS = [
  { id: 'sala', label: 'Tengo una sala', placeholder: 'Contanos de tu sala: dónde está, cuántas butacas tiene, qué tipo de obras recibe…' },
  { id: 'obra', label: 'Busco dónde presentar', placeholder: 'Contanos de la obra o del proyecto: qué es, cuándo te gustaría estrenar, qué necesitás…' },
  { id: 'butaca', label: 'Quiero auspiciar una butaca', placeholder: 'Contanos de tu marca y qué te gustaría lograr con TRAMA…' },
  { id: 'problema', label: 'Algo no anda', placeholder: 'Qué estabas haciendo, qué esperabas que pasara y qué pasó…' },
  { id: 'otra', label: 'Otra cosa', placeholder: 'Lo que quieras: una idea, una propuesta, una duda…' },
]

// Atajos para quien quizás no necesita escribir.
const SHORTCUTS = [
  { to: '/como-funciona', title: 'Cómo funciona', text: 'Preguntas frecuentes sobre cuentas, consultas y datos.' },
  { to: '/planes', title: 'Membresías', text: 'Qué incluye cada plan y cuánto cuesta.' },
  { to: '/publicar', title: 'Publicar', text: 'Sumá tu sala, tu obra o tu servicio.' },
]

export default function ContactPage() {
  useDocumentTitle('Contacto')
  const { user } = useAuth()
  const [params] = useSearchParams()
  const topicFromUrl = TOPICS.find((t) => t.id === params.get('tema'))?.id ?? null
  const [topic, setTopic] = useState(topicFromUrl)
  const [challenge, setChallenge] = useState(null)
  const [challengeError, setChallengeError] = useState(null)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState(null)
  const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { name: user ? `${user.firstName} ${user.lastName}` : '', email: user?.email ?? '', company: '', msg: '', answer: '', website: '' },
  })
  const current = TOPICS.find((t) => t.id === topic)

  async function loadChallenge() {
    setChallengeError(null)
    setValue('answer', '')
    try { setChallenge(await contactService.getChallenge()) } catch (e) { setChallengeError(e) }
  }
  useEffect(() => { loadChallenge() }, []) // eslint-disable-line react-hooks/exhaustive-deps
  // Si se llega con otro ?tema= estando ya en la página, se marca ese.
  useEffect(() => { if (topicFromUrl) setTopic(topicFromUrl) }, [topicFromUrl])

  async function onSubmit(data) {
    setError(null)
    const msg = current ? `[${current.label}]\n\n${data.msg}` : data.msg
    try {
      await contactService.send({ ...data, msg, challenge: challenge?.token })
      setSent(true)
      reset()
    } catch (e) {
      setError(e)
      loadChallenge()
    }
  }

  return (
    <div className="relative overflow-hidden">
      {/* Luz de color suave detrás del título */}
      <PageContainer className="relative grid max-w-6xl gap-10 pb-16 pt-8 sm:pt-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:grid-rows-[auto_1fr] lg:gap-x-16">
        <header className="lg:col-start-1 lg:row-start-1">
          <Breadcrumbs items={[{ label: 'Inicio', to: '/' }, { label: 'Contacto' }]} />
          <p className="tag mb-4">Contacto</p>
          <h1 className="font-display text-4xl font-bold tracking-tight sm:text-6xl">Hablemos.</h1>
          <p className="mt-3 text-base text-ink-soft sm:text-lg">Una sala, una obra, una idea suelta o algo que no anda. Escribinos como le escribirías a alguien del equipo.</p>
        </header>

        {/* En celular va debajo del formulario; en escritorio, bajo el título. */}
        <nav aria-label="Atajos" className="order-last lg:order-none lg:col-start-1 lg:row-start-2">
          <p className="text-sm font-semibold">¿Buscabas otra cosa?</p>
          <ul className="mt-3 divide-y divide-line border-y border-line">
            {SHORTCUTS.map((s) => (
              <li key={s.to}>
                <Link to={s.to} className="group flex items-center justify-between gap-4 py-3.5">
                  <span>
                    <span className="block font-semibold group-hover:text-accent">{s.title}</span>
                    <span className="block text-sm text-ink-soft">{s.text}</span>
                  </span>
                  <ArrowRight aria-hidden className="size-4 shrink-0 text-ink-soft transition-transform group-hover:translate-x-1 group-hover:text-accent" />
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ticket enter lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-start">
          {/* Talón de la entrada */}
          <div className="px-6 pb-5 pt-6 sm:px-8">
            <p className="font-display text-lg font-bold tracking-tight">TRAMA <span className="font-normal text-ink-soft">· Entrada de contacto</span></p>
          </div>
          <div aria-hidden className="ticket-tear" />

          {sent ? (
            <div role="status" className="relative px-6 py-12 text-center sm:px-8">
              <span aria-hidden className="ticket-stamp">Recibido</span>
              <h2 className="mt-6 font-display text-2xl font-semibold">¡Listo, nos llegó!</h2>
              <p className="mt-1 text-sm text-ink-soft">Lo leemos y te respondemos al correo que nos dejaste.</p>
              <Button variant="secondary" className="mt-6" onClick={() => { setSent(false); setTopic(null); loadChallenge() }}>Escribir otra cosa</Button>
            </div>
          ) : (
            <form noValidate onSubmit={handleSubmit(onSubmit)} className="space-y-6 px-6 pb-8 pt-6 sm:px-8">
              <fieldset>
                <legend className="text-sm font-semibold">¿Qué te trae por acá?</legend>
                <div className="mt-3 flex flex-wrap gap-2">
                  {TOPICS.map((t) => (
                    <button key={t.id} type="button" aria-pressed={topic === t.id} onClick={() => setTopic(topic === t.id ? null : t.id)}
                      className={cn('border px-3.5 py-1.5 text-sm font-medium transition-colors',
                        topic === t.id ? 'border-brand bg-brand text-white' : 'border-line-strong bg-surface hover:border-ink-soft')}>
                      {t.label}
                    </button>
                  ))}
                </div>
              </fieldset>

              <div className="grid gap-5 sm:grid-cols-2">
                <FormField label="¿Cómo te llamás?" required error={errors.name?.message}><Input autoComplete="name" {...register('name')} /></FormField>
                <FormField label="Tu correo" hint="Ahí te respondemos." required error={errors.email?.message}><Input type="email" autoComplete="email" {...register('email')} /></FormField>
              </div>
              <FormField label="Sala, compañía u organización" hint="Si aplica." error={errors.company?.message}><Input autoComplete="organization" {...register('company')} /></FormField>
              <FormField label="Contanos" required error={errors.msg?.message}>
                <Textarea rows={6} placeholder={current?.placeholder ?? 'Lo que quieras contarnos…'} {...register('msg')} />
              </FormField>
              {/* Oculto para personas: solo los bots lo completan. */}
              <div aria-hidden className="absolute -left-[9999px]"><label>Sitio web<input tabIndex={-1} autoComplete="off" {...register('website')} /></label></div>
              {challenge ? (
                <FormField label={`Una para humanos: ¿cuál es el número más grande? ${challenge.numbers.join(', ')}`} required error={errors.answer?.message}>
                  <Select placeholder="Elegí uno" options={challenge.numbers.map((n) => ({ id: String(n), label: String(n) }))} {...register('answer')} />
                </FormField>
              ) : challengeError ? (
                <div className="space-y-2">
                  <FormError error={challengeError} />
                  <p className="text-sm text-ink-soft">El formulario necesita la API de contacto (npm run dev:api). Ver README.</p>
                  <Button variant="secondary" size="sm" onClick={loadChallenge}>Reintentar</Button>
                </div>
              ) : <p className="text-sm text-ink-soft">Cargando verificación…</p>}
              <FormError error={error} />
              <Button type="submit" loading={isSubmitting} disabled={!challenge}>Mandar mensaje</Button>
            </form>
          )}
        </div>
      </PageContainer>
    </div>
  )
}
