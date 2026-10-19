import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { FormField, Input, Textarea, Select, CheckboxGroup } from '@/components/forms/FormField'
import { FormError } from '@/components/forms/FormError'
import { resourcesService } from '@/services'
import { useTaxonomies } from '@/hooks/useTaxonomies'
import { useSubmit } from '@/features/inquiries/useSubmit'
import { slugify } from '@/utils/slug'

const path = z.union([z.literal(''), z.string().regex(/^(\/|https:\/\/)/, 'Tiene que empezar con / o https://')])
const schema = z.object({
  title: z.string().trim().min(3, 'Mínimo 3 caracteres'),
  slug: z.string().trim().regex(/^[a-z0-9-]*$/, 'Solo minúsculas, números y guiones'),
  author: z.string().trim().min(2, 'Indicá el autor o responsable'),
  description: z.string().trim().min(10, 'Mínimo 10 caracteres'),
  body: z.string(),
  resourceType: z.string().min(1, 'Elegí el formato'),
  category: z.string().min(1, 'Elegí la categoría'),
  topics: z.array(z.string()),
  accessLevel: z.enum(['public', 'member', 'premium']),
  durationMinutes: z.union([z.literal(''), z.coerce.number().int().min(1)]),
  mediaUrl: path,
  fileUrl: path,
  coverImage: path,
})

const TOPICS = ['produccion', 'gestion', 'giras', 'tecnica', 'iluminacion', 'formacion', 'financiacion', 'contratacion', 'convocatorias']
  .map((id) => ({ id, label: id.charAt(0).toUpperCase() + id.slice(1) }))

const toForm = (r) => ({
  title: r?.title ?? '', slug: r?.slug ?? '', author: r?.author ?? '', description: r?.description ?? '',
  body: (r?.body ?? []).join('\n\n'), resourceType: r?.resourceType ?? '', category: r?.category ?? '', topics: r?.topics ?? [],
  accessLevel: r?.accessLevel ?? 'public', durationMinutes: r?.durationMinutes ?? '', mediaUrl: r?.mediaUrl ?? '', fileUrl: r?.fileUrl ?? '', coverImage: r?.coverImage ?? '',
})

export function ResourceEditor({ open, onClose, resource }) {
  const { tax } = useTaxonomies()
  const { register, control, handleSubmit, reset, setValue, getValues, setError: setFieldError, formState: { errors } } = useForm({ resolver: zodResolver(schema), defaultValues: toForm(resource) })
  useEffect(() => { if (open) reset(toForm(resource)) }, [open, resource, reset])
  const { run, submitting, error } = useSubmit({ successTitle: resource ? 'Recurso actualizado' : 'Recurso creado como borrador', onSuccess: onClose })

  async function onSubmit(data) {
    const payload = {
      ...data, id: resource?.id,
      body: data.body.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean),
      durationMinutes: data.durationMinutes || null, mediaUrl: data.mediaUrl || null, fileUrl: data.fileUrl || null, coverImage: data.coverImage || null,
    }
    await run(async () => {
      try {
        return await resourcesService.save(payload)
      } catch (e) {
        if (e.details?.slug) setFieldError('slug', { message: e.details.slug })
        throw e
      }
    })
  }

  return (
    <Modal open={open} onClose={onClose} size="lg" title={resource ? 'Editar recurso' : 'Nuevo recurso'}
      description="Los recursos nuevos quedan en borrador hasta que los publiques.">
      <form noValidate className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Título" required error={errors.title?.message}>
            <Input {...register('title', { onBlur: () => !getValues('slug') && setValue('slug', slugify(getValues('title'))) })} />
          </FormField>
          <FormField label="Dirección (slug)" hint="Se genera del título. Solo minúsculas y guiones." error={errors.slug?.message}><Input {...register('slug')} /></FormField>
          <FormField label="Autor o responsable" required error={errors.author?.message}><Input {...register('author')} /></FormField>
          <FormField label="Acceso" required><Select options={[{ id: 'public', label: 'Gratuito' }, { id: 'member', label: 'Miembros' }, { id: 'premium', label: 'Plan Profesional' }]} {...register('accessLevel')} /></FormField>
          <FormField label="Formato" required error={errors.resourceType?.message}><Select placeholder="Elegí" options={tax.resourceTypes} {...register('resourceType')} /></FormField>
          <FormField label="Categoría" required error={errors.category?.message}><Select placeholder="Elegí" options={tax.resourceCategories} {...register('category')} /></FormField>
          <FormField label="Duración (minutos)" hint="Opcional" error={errors.durationMinutes?.message}><Input type="number" min={1} {...register('durationMinutes')} /></FormField>
          <FormField label="Portada (URL)" hint="Opcional" error={errors.coverImage?.message}><Input {...register('coverImage')} /></FormField>
          <FormField label="Audio o video (URL)" hint="Fuente con licencia. Opcional." error={errors.mediaUrl?.message}><Input {...register('mediaUrl')} /></FormField>
          <FormField label="Archivo descargable (ruta)" hint="Ej. /demo/archivo.pdf. Tiene que existir." error={errors.fileUrl?.message}><Input {...register('fileUrl')} /></FormField>
        </div>
        <FormField label="Descripción" required error={errors.description?.message}><Textarea rows={2} {...register('description')} /></FormField>
        <FormField label="Contenido" hint="Texto plano. Separá párrafos con una línea en blanco. No se admite HTML."><Textarea rows={6} {...register('body')} /></FormField>
        <Controller control={control} name="topics" render={({ field }) => <CheckboxGroup legend="Temas" columns={3} options={TOPICS} value={field.value} onChange={field.onChange} />} />
        <FormError error={error} />
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="submit" loading={submitting}>Guardar</Button>
        </div>
      </form>
    </Modal>
  )
}
