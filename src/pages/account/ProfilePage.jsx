import { useEffect } from 'react'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Trash2, Globe, Lock } from 'lucide-react'
import { AccountHeader } from './AccountLayout'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { FormField, Input, Textarea, Select, CheckboxGroup, Checkbox } from '@/components/forms/FormField'
import { FormError } from '@/components/forms/FormError'
import { profilesService, configService } from '@/services'
import { useSubmit } from '@/features/inquiries/useSubmit'
import { useAuth } from '@/context/AuthContext'
import { useTaxonomies } from '@/hooks/useTaxonomies'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useUnsavedChanges } from '@/hooks/useUnsavedChanges'

const schema = z.object({
  firstName: z.string().trim().min(1, 'Obligatorio').max(60),
  lastName: z.string().trim().min(1, 'Obligatorio').max(60),
  avatar: z.union([z.literal(''), z.string().url('Tiene que ser una URL').startsWith('https://', 'Tiene que empezar con https://')]),
  bio: z.string().max(600, 'Máximo 600 caracteres'),
  country: z.string().min(1),
  city: z.string().min(1, 'Elegí tu ciudad'),
  specialties: z.array(z.string()),
  links: z.array(z.object({ label: z.string().trim().min(1, 'Poné un nombre'), url: z.string().url('URL no válida').startsWith('https://', 'Tiene que empezar con https://') })).max(6),
  publicContact: z.object({ showEmail: z.boolean(), phone: z.string().max(30) }),
})

function SectionTitle({ icon: Icon, title, text }) {
  return (
    <div className="mb-4">
      <h2 className="flex items-center gap-2 font-semibold"><Icon aria-hidden className="size-4 text-ink-soft" />{title}</h2>
      <p className="text-xs text-ink-soft">{text}</p>
    </div>
  )
}

export default function ProfilePage() {
  useDocumentTitle('Perfil')
  const { user } = useAuth()
  const { tax } = useTaxonomies()
  const countries = configService.countries()
  const toForm = (u) => ({
    firstName: u.firstName, lastName: u.lastName, avatar: u.avatar ?? '', bio: u.bio ?? '', country: u.country, city: u.city,
    specialties: u.specialties ?? [], links: u.links ?? [], publicContact: { showEmail: Boolean(u.publicContact?.showEmail), phone: u.publicContact?.phone ?? '' },
  })
  const { register, control, handleSubmit, reset, watch, formState: { errors, isDirty } } = useForm({ resolver: zodResolver(schema), defaultValues: toForm(user) })
  const links = useFieldArray({ control, name: 'links' })
  const blocker = useUnsavedChanges(isDirty)
  const { run, submitting, error } = useSubmit({ successTitle: 'Perfil actualizado', onSuccess: (u) => reset(toForm(u)) })
  useEffect(() => { if (!isDirty) reset(toForm(user)) }, [user]) // eslint-disable-line react-hooks/exhaustive-deps
  const country = countries.find((c) => c.code === watch('country'))

  return (
    <>
      <AccountHeader title="Perfil" description="Lo que marcás como público lo ve cualquier persona en TRAMA. Tu correo nunca se muestra salvo que lo actives." />
      <form noValidate className="space-y-6" onSubmit={handleSubmit((data) => run(() => profilesService.updateMe({ ...data, avatar: data.avatar || null, publicContact: { ...data.publicContact, phone: data.publicContact.phone || null } })))}>
        <Card className="space-y-5 p-5 sm:p-6">
          <SectionTitle icon={Globe} title="Datos públicos" text="Se muestran en tu perfil y junto a tus publicaciones." />
          <div className="flex items-center gap-4">
            <Avatar name={`${watch('firstName')} ${watch('lastName')}`} src={watch('avatar') || null} size="lg" />
            <FormField label="Foto (URL)" hint="Subir fotos necesita almacenamiento real; por ahora, un enlace https." error={errors.avatar?.message} className="flex-1">
              <Input placeholder="https://…" {...register('avatar')} />
            </FormField>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField label="Nombre" required error={errors.firstName?.message}><Input {...register('firstName')} /></FormField>
            <FormField label="Apellido" required error={errors.lastName?.message}><Input {...register('lastName')} /></FormField>
            <FormField label="País" required><Select options={countries.map((c) => ({ id: c.code, label: c.name }))} {...register('country')} /></FormField>
            <FormField label="Ciudad" required error={errors.city?.message}><Select placeholder="Elegí tu ciudad" options={(country?.cities ?? []).map((c) => ({ id: c.name, label: c.name }))} {...register('city')} /></FormField>
          </div>
          <FormField label="Biografía" hint="Hasta 600 caracteres." error={errors.bio?.message}><Textarea rows={4} {...register('bio')} /></FormField>
          <Controller control={control} name="specialties" render={({ field }) => (
            <CheckboxGroup legend="Especialidades" columns={3} options={tax.specialties} value={field.value} onChange={field.onChange} />
          )} />
          <fieldset className="space-y-2">
            <legend className="text-sm font-semibold">Enlaces profesionales</legend>
            {links.fields.map((f, i) => (
              <div key={f.id} className="grid gap-2 sm:grid-cols-[10rem_1fr_auto]">
                <FormField label={`Nombre del enlace ${i + 1}`} error={errors.links?.[i]?.label?.message}><Input placeholder="Portfolio" {...register(`links.${i}.label`)} /></FormField>
                <FormField label="URL" error={errors.links?.[i]?.url?.message}><Input placeholder="https://…" {...register(`links.${i}.url`)} /></FormField>
                <Button variant="ghost" size="icon" className="self-end" onClick={() => links.remove(i)} aria-label={`Quitar enlace ${i + 1}`}><Trash2 aria-hidden className="size-4" /></Button>
              </div>
            ))}
            {links.fields.length < 6 && <Button variant="secondary" size="sm" icon={Plus} onClick={() => links.append({ label: '', url: '' })}>Agregar enlace</Button>}
          </fieldset>
        </Card>
        <Card className="space-y-4 p-5 sm:p-6">
          <SectionTitle icon={Lock} title="Contacto visible" text="Por defecto, nadie ve tu correo ni tu teléfono: el contacto se hace por mensajes." />
          <p className="text-sm">Correo de la cuenta (privado): <strong>{user.email}</strong></p>
          <Checkbox label="Mostrar mi correo en mi perfil público" {...register('publicContact.showEmail')} />
          <FormField label="Teléfono público" hint="Opcional. Dejalo vacío para no mostrarlo."><Input type="tel" {...register('publicContact.phone')} /></FormField>
        </Card>
        <FormError error={error} />
        <div className="flex justify-end gap-2">
          <Button variant="secondary" disabled={!isDirty} onClick={() => reset(toForm(user))}>Descartar cambios</Button>
          <Button type="submit" loading={submitting} disabled={!isDirty}>Guardar perfil</Button>
        </div>
      </form>
      <ConfirmDialog open={blocker.state === 'blocked'} title="¿Salir sin guardar?" description="Tenés cambios en tu perfil que no guardaste."
        confirmLabel="Salir sin guardar" cancelLabel="Seguir editando" onConfirm={() => blocker.proceed?.()} onCancel={() => blocker.reset?.()} />
    </>
  )
}
