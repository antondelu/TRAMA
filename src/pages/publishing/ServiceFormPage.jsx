import { Controller, useFieldArray } from 'react-hook-form'
import { z } from 'zod'
import { Plus, Trash2 } from 'lucide-react'
import { PublicationFormShell, FormSection } from '@/features/publishing/PublicationFormShell'
import { usePublicationForm } from '@/features/publishing/usePublicationForm'
import { toLines, fromLines, emptyToNull, optionalNumber, slugField, requiredLines } from '@/features/publishing/formHelpers'
import { LinesInput } from '@/components/forms/LinesInput'
import { FormField, Input, Textarea, Select, CheckboxGroup } from '@/components/forms/FormField'
import { FileUpload } from '@/components/forms/FileUpload'
import { Button } from '@/components/ui/Button'
import { ProfessionalCard } from '@/components/cards/ProfessionalCard'
import { SpotlightText } from '@/components/ui/SpotlightText'
import { servicesService, configService } from '@/services'
import { useTaxonomies } from '@/hooks/useTaxonomies'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

const schema = z.object({
  name: z.string().trim().min(2, 'Mínimo 2 caracteres').max(100), slug: slugField,
  providerType: z.string().min(1, 'Elegí el tipo de proveedor'),
  specialties: z.array(z.string()).min(1, 'Elegí al menos una especialidad'),
  headline: z.string().trim().min(5, 'Escribí una frase corta').max(120),
  description: z.string().trim().min(30, 'Mínimo 30 caracteres').max(2000),
  department: z.string().min(1, 'Elegí el departamento'), city: z.string().min(1, 'Elegí la ciudad'),
  workModes: z.array(z.string()).min(1, 'Elegí al menos una modalidad'),
  experienceYears: optionalNumber,
  photos: z.array(z.any()),
  cv: z.array(z.any()),
  servicesOffered: requiredLines('Indicá al menos un servicio'),
  availability: z.string().min(1),
  priceFrom: optionalNumber, priceUnit: z.string(),
  links: z.array(z.object({ label: z.string().trim().min(1, 'Poné un nombre'), url: z.string().url('URL no válida').startsWith('https://', 'Tiene que empezar con https://') })).max(6),
  contactEmail: z.union([z.literal(''), z.string().email('Correo no válido')]), contactPhone: z.string().max(30),
})

const empty = {
  name: '', slug: '', providerType: '', specialties: [], headline: '', description: '', department: '', city: '', workModes: [],
  experienceYears: '', photos: [], cv: [], servicesOffered: '', availability: 'disponible', priceFrom: '', priceUnit: 'por proyecto',
  links: [], contactEmail: '', contactPhone: '',
}

const toForm = (p) => ({
  ...empty, name: p.name, slug: p.slug, providerType: p.providerType, specialties: p.specialties, headline: p.headline, description: p.description,
  department: p.location.department, city: p.location.city, workModes: p.workModes, experienceYears: p.experienceYears ?? '', photos: p.images ?? [],
  cv: p.cv ? [p.cv] : [], servicesOffered: toLines(p.servicesOffered), availability: p.availability ?? 'disponible',
  priceFrom: p.priceFrom ?? '', priceUnit: p.priceUnit ?? 'por proyecto', links: p.links ?? [],
  contactEmail: p.contact?.email ?? '', contactPhone: p.contact?.phone ?? '',
})

const level = (y) => (y === '' ? null : y < 3 ? 'inicial' : y <= 10 ? 'media' : 'senior')
const toPayload = (d) => ({
  name: d.name.trim(), slug: d.slug, providerType: d.providerType, specialties: d.specialties, headline: d.headline.trim(), description: d.description.trim(),
  location: { country: 'UY', department: d.department, city: d.city }, workModes: d.workModes,
  experienceYears: d.experienceYears === '' ? null : Number(d.experienceYears), experienceLevel: level(d.experienceYears === '' ? '' : Number(d.experienceYears)),
  cv: d.cv[0]?.url ? { name: d.cv[0].name, url: d.cv[0].url } : null, servicesOffered: fromLines(d.servicesOffered), availability: d.availability,
  priceFrom: d.priceFrom === '' ? null : Number(d.priceFrom), priceUnit: d.priceFrom === '' ? null : d.priceUnit, currency: 'UYU',
  // Solo la foto con URL (la que tiene vista previa); ver utils/image.js.
  links: d.links, images: d.photos.filter((p) => p.url), verified: false,
  // Privados: no se muestran en el perfil público.
  contact: { email: emptyToNull(d.contactEmail), phone: emptyToNull(d.contactPhone) },
})

export default function ServiceFormPage() {
  const ctl = usePublicationForm({ schema, emptyValues: empty, toForm, toPayload, service: servicesService, titleField: 'name' })
  useDocumentTitle(ctl.editId ? 'Editar servicio' : 'Ofrecer servicios')
  const { tax } = useTaxonomies()
  const uy = configService.countries()[0]
  const { register, control, watch, setValue, formState: { errors } } = ctl.form
  const links = useFieldArray({ control, name: 'links' })
  const department = watch('department')

  return (
    <PublicationFormShell ctl={ctl} kindLabel="servicio" title={ctl.editId ? 'Editar perfil profesional' : <SpotlightText before="Tu talento merece" lit="ser visto." />}
      preview={(d) => <ProfessionalCard pro={{ ...toPayload(d), id: 'preview', slug: d.slug || 'vista-previa', name: d.name || 'Nombre profesional' }} />}>
      <FormSection title="Perfil">
        {/* La dirección (slug) la arma TRAMA a partir del nombre: no se muestra. */}
        <FormField label="Nombre profesional o comercial" required error={errors.name?.message}><Input {...register('name')} /></FormField>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Tipo de proveedor" required error={errors.providerType?.message}><Select placeholder="Elegí" options={tax.providerTypes} {...register('providerType')} /></FormField>
          <FormField label="Años de experiencia" hint="Declarados por vos; TRAMA no los verifica." error={errors.experienceYears?.message}><Input type="number" min={0} {...register('experienceYears')} /></FormField>
        </div>
        <FormField label="Frase de presentación" required hint="Ej. Diseño de iluminación para teatro y danza" error={errors.headline?.message}><Input {...register('headline')} /></FormField>
        <FormField label="Descripción" required error={errors.description?.message}><Textarea rows={4} {...register('description')} /></FormField>
        <Controller control={control} name="specialties" render={({ field }) => (
          <CheckboxGroup legend="Especialidades" required columns={3} options={tax.specialties} value={field.value} onChange={field.onChange} error={errors.specialties?.message} />
        )} />
      </FormSection>

      <FormSection title="Dónde y cómo trabajás">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Departamento" required error={errors.department?.message}><Select placeholder="Elegí" options={uy.departments.map((d) => ({ id: d, label: d }))} {...register('department', { onChange: () => setValue('city', '') })} /></FormField>
          <FormField label="Ciudad" required error={errors.city?.message}><Select placeholder="Elegí" options={uy.cities.filter((c) => !department || c.department === department).map((c) => ({ id: c.name, label: c.name }))} {...register('city')} /></FormField>
          <FormField label="Disponibilidad"><Select options={tax.serviceAvailability} {...register('availability')} /></FormField>
        </div>
        <Controller control={control} name="workModes" render={({ field }) => (
          <CheckboxGroup legend="Modalidad" required options={tax.workModes} value={field.value} onChange={field.onChange} error={errors.workModes?.message} />
        )} />
      </FormSection>

      <FormSection title="Servicios y tarifas">
        <FormField label="Servicios ofrecidos" required error={errors.servicesOffered?.message}><Controller control={control} name="servicesOffered" render={({ field }) => <LinesInput {...field} addLabel="Agregar servicio" placeholder="Ej. Diseño de iluminación" />} /></FormField>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Precio orientativo desde (UYU)" hint="Opcional" error={errors.priceFrom?.message}><Input type="number" min={0} {...register('priceFrom')} /></FormField>
          <FormField label="Unidad"><Select options={['por proyecto', 'por función', 'por hora', 'por día', 'por mes', 'por pieza', 'por página'].map((u) => ({ id: u, label: u }))} {...register('priceUnit')} /></FormField>
        </div>
      </FormSection>

      <FormSection title="Portfolio y enlaces">
        <Controller control={control} name="photos" render={({ field }) => (
          <FileUpload label="Foto o flyer" maxFiles={1} value={field.value} onChange={field.onChange} hint="JPG, PNG o WebP de hasta 5 MB. En la demo queda guardada solo en esta pestaña." />
        )} />
        <Controller control={control} name="cv" render={({ field }) => (
          <FileUpload label="CV (opcional)" accept="application/pdf" maxFiles={1} value={field.value} onChange={field.onChange} hint="PDF de hasta 5 MB. Quien vea tu perfil lo va a poder descargar." />
        )} />
        <hr className="border-line" />
        {links.fields.map((f, i) => (
          <div key={f.id} className="grid gap-2 sm:grid-cols-[10rem_1fr_auto]">
            <FormField label={`Enlace ${i + 1}`} error={errors.links?.[i]?.label?.message}><Input placeholder="Portfolio" {...register(`links.${i}.label`)} /></FormField>
            <FormField label="URL" error={errors.links?.[i]?.url?.message}><Input placeholder="https://…" {...register(`links.${i}.url`)} /></FormField>
            <Button variant="ghost" size="icon" className="self-end" aria-label={`Quitar enlace ${i + 1}`} onClick={() => links.remove(i)}><Trash2 aria-hidden className="size-4" /></Button>
          </div>
        ))}
        {links.fields.length < 6 && <Button variant="secondary" size="sm" icon={Plus} onClick={() => links.append({ label: '', url: '' })}>Agregar enlace profesional</Button>}
      </FormSection>

      <FormSection title="Datos de contacto" description="Privados: las consultas llegan por mensajes de TRAMA.">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Correo (privado)" error={errors.contactEmail?.message}><Input type="email" {...register('contactEmail')} /></FormField>
          <FormField label="Teléfono (privado)"><Input type="tel" {...register('contactPhone')} /></FormField>
        </div>
      </FormSection>
    </PublicationFormShell>
  )
}
