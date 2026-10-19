import { Controller, useFieldArray } from 'react-hook-form'
import { z } from 'zod'
import { Plus, Trash2 } from 'lucide-react'
import { PublicationFormShell, FormSection } from '@/features/publishing/PublicationFormShell'
import { usePublicationForm } from '@/features/publishing/usePublicationForm'
import { toLines, fromLines, emptyToNull, optionalNumber, slugField, requiredLines } from '@/features/publishing/formHelpers'
import { FormField, Input, Textarea, Select, CheckboxGroup } from '@/components/forms/FormField'
import { Button } from '@/components/ui/Button'
import { ProfessionalCard } from '@/components/cards/ProfessionalCard'
import { servicesService, configService } from '@/services'
import { useTaxonomies } from '@/hooks/useTaxonomies'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

const year = new Date().getFullYear()
const schema = z.object({
  name: z.string().trim().min(2, 'Mínimo 2 caracteres').max(100), slug: slugField,
  providerType: z.string().min(1, 'Elegí el tipo de proveedor'),
  specialties: z.array(z.string()).min(1, 'Elegí al menos una especialidad'),
  headline: z.string().trim().min(5, 'Escribí una frase corta').max(120),
  description: z.string().trim().min(30, 'Mínimo 30 caracteres').max(2000),
  department: z.string().min(1, 'Elegí el departamento'), city: z.string().min(1, 'Elegí la ciudad'),
  workModes: z.array(z.string()).min(1, 'Elegí al menos una modalidad'),
  experienceYears: optionalNumber,
  portfolio: z.array(z.object({
    title: z.string().trim().min(1, 'Poné el título'), year: z.coerce.number().int().min(1950, 'Año no válido').max(year + 1, 'Año no válido'), role: z.string().trim().min(1, 'Indicá tu rol'),
  })).max(20),
  servicesOffered: requiredLines('Indicá al menos un servicio'),
  availability: z.string().min(1),
  priceFrom: optionalNumber, priceUnit: z.string(),
  links: z.array(z.object({ label: z.string().trim().min(1, 'Poné un nombre'), url: z.string().url('URL no válida').startsWith('https://', 'Tiene que empezar con https://') })).max(6),
  contactEmail: z.union([z.literal(''), z.string().email('Correo no válido')]), contactPhone: z.string().max(30),
})

const empty = {
  name: '', slug: '', providerType: '', specialties: [], headline: '', description: '', department: '', city: '', workModes: [],
  experienceYears: '', portfolio: [], servicesOffered: '', availability: 'disponible', priceFrom: '', priceUnit: 'por proyecto',
  links: [], contactEmail: '', contactPhone: '',
}

const toForm = (p) => ({
  ...empty, name: p.name, slug: p.slug, providerType: p.providerType, specialties: p.specialties, headline: p.headline, description: p.description,
  department: p.location.department, city: p.location.city, workModes: p.workModes, experienceYears: p.experienceYears ?? '',
  portfolio: p.portfolio ?? [], servicesOffered: toLines(p.servicesOffered), availability: p.availability ?? 'disponible',
  priceFrom: p.priceFrom ?? '', priceUnit: p.priceUnit ?? 'por proyecto', links: p.links ?? [],
  contactEmail: p.contact?.email ?? '', contactPhone: p.contact?.phone ?? '',
})

const level = (y) => (y === '' ? null : y < 3 ? 'inicial' : y <= 10 ? 'media' : 'senior')
const toPayload = (d) => ({
  name: d.name.trim(), slug: d.slug, providerType: d.providerType, specialties: d.specialties, headline: d.headline.trim(), description: d.description.trim(),
  location: { country: 'UY', department: d.department, city: d.city }, workModes: d.workModes,
  experienceYears: d.experienceYears === '' ? null : Number(d.experienceYears), experienceLevel: level(d.experienceYears === '' ? '' : Number(d.experienceYears)),
  portfolio: d.portfolio, servicesOffered: fromLines(d.servicesOffered), availability: d.availability,
  priceFrom: d.priceFrom === '' ? null : Number(d.priceFrom), priceUnit: d.priceFrom === '' ? null : d.priceUnit, currency: 'UYU',
  links: d.links, images: [], verified: false,
  // Privados: no se muestran en el perfil público.
  contact: { email: emptyToNull(d.contactEmail), phone: emptyToNull(d.contactPhone) },
})

export default function ServiceFormPage() {
  const ctl = usePublicationForm({ schema, emptyValues: empty, toForm, toPayload, service: servicesService, titleField: 'name' })
  useDocumentTitle(ctl.editId ? 'Editar servicio' : 'Ofrecer servicios')
  const { tax } = useTaxonomies()
  const uy = configService.countries()[0]
  const { register, control, watch, formState: { errors } } = ctl.form
  const portfolio = useFieldArray({ control, name: 'portfolio' })
  const links = useFieldArray({ control, name: 'links' })
  const department = watch('department')

  return (
    <PublicationFormShell ctl={ctl} kindLabel="servicio" title={ctl.editId ? 'Editar perfil profesional' : 'Sumate al directorio'}
      preview={(d) => <ProfessionalCard pro={{ ...toPayload(d), id: 'preview', slug: d.slug || 'vista-previa', name: d.name || 'Nombre profesional' }} />}>
      <FormSection title="Perfil">
        <FormField label="Nombre profesional o comercial" required error={errors.name?.message}><Input {...register('name', { onBlur: ctl.fillSlug })} /></FormField>
        <FormField label="Dirección en TRAMA (slug)" hint={`trama.uy/servicios/${watch('slug') || 'nombre'}`} error={errors.slug?.message}><Input {...register('slug')} /></FormField>
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
          <FormField label="Departamento" required error={errors.department?.message}><Select placeholder="Elegí" options={uy.departments.map((d) => ({ id: d, label: d }))} {...register('department')} /></FormField>
          <FormField label="Ciudad" required error={errors.city?.message}><Select placeholder="Elegí" options={uy.cities.filter((c) => !department || c.department === department).map((c) => ({ id: c.name, label: c.name }))} {...register('city')} /></FormField>
          <FormField label="Disponibilidad"><Select options={tax.serviceAvailability} {...register('availability')} /></FormField>
        </div>
        <Controller control={control} name="workModes" render={({ field }) => (
          <CheckboxGroup legend="Modalidad" required options={tax.workModes} value={field.value} onChange={field.onChange} error={errors.workModes?.message} />
        )} />
      </FormSection>

      <FormSection title="Servicios y tarifas">
        <FormField label="Servicios ofrecidos" required hint="Uno por línea" error={errors.servicesOffered?.message}><Textarea rows={4} {...register('servicesOffered')} /></FormField>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Precio orientativo desde (UYU)" hint="Opcional" error={errors.priceFrom?.message}><Input type="number" min={0} {...register('priceFrom')} /></FormField>
          <FormField label="Unidad"><Select options={['por proyecto', 'por función', 'por hora', 'por día', 'por mes', 'por pieza', 'por página'].map((u) => ({ id: u, label: u }))} {...register('priceUnit')} /></FormField>
        </div>
      </FormSection>

      <FormSection title="Portfolio y enlaces">
        {portfolio.fields.map((f, i) => (
          <div key={f.id} className="grid gap-2 sm:grid-cols-[1fr_6rem_1fr_auto]">
            <FormField label={`Trabajo ${i + 1}`} error={errors.portfolio?.[i]?.title?.message}><Input {...register(`portfolio.${i}.title`)} /></FormField>
            <FormField label="Año" error={errors.portfolio?.[i]?.year?.message}><Input type="number" {...register(`portfolio.${i}.year`)} /></FormField>
            <FormField label="Rol" error={errors.portfolio?.[i]?.role?.message}><Input {...register(`portfolio.${i}.role`)} /></FormField>
            <Button variant="ghost" size="icon" className="self-end" aria-label={`Quitar trabajo ${i + 1}`} onClick={() => portfolio.remove(i)}><Trash2 aria-hidden className="size-4" /></Button>
          </div>
        ))}
        <Button variant="secondary" size="sm" icon={Plus} onClick={() => portfolio.append({ title: '', year: year, role: '' })}>Agregar trabajo</Button>
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
