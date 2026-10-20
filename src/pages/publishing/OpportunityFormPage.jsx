import { Controller } from 'react-hook-form'
import { z } from 'zod'
import { PublicationFormShell, FormSection } from '@/features/publishing/PublicationFormShell'
import { usePublicationForm } from '@/features/publishing/usePublicationForm'
import { toLines, fromLines, slugField, httpsUrl } from '@/features/publishing/formHelpers'
import { LinesInput } from '@/components/forms/LinesInput'
import { FormField, Input, Textarea, Select, CheckboxGroup } from '@/components/forms/FormField'
import { OpportunityCard } from '@/components/cards/OpportunityCard'
import { opportunitiesService, venuesService, configService } from '@/services'
import { useServiceQuery } from '@/hooks/useServiceQuery'
import { useTaxonomies } from '@/hooks/useTaxonomies'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { todayISO } from '@/utils/dates'

const schema = z.object({
  title: z.string().trim().min(5, 'Mínimo 5 caracteres').max(140), slug: slugField,
  organizationName: z.string().trim().min(2, 'Indicá quién convoca'), organizationType: z.string().min(1, 'Elegí una opción'),
  venueId: z.string(), opportunityType: z.string().min(1, 'Elegí el tipo'),
  description: z.string().trim().min(30, 'Mínimo 30 caracteres').max(3000),
  requirements: z.string(), disciplines: z.array(z.string()).min(1, 'Elegí al menos una disciplina'),
  city: z.string(), scope: z.string().trim().min(2, 'Indicá el lugar o alcance'),
  applicationStart: z.string().min(1, 'Indicá la fecha de apertura'),
  deadline: z.string().min(1, 'Indicá la fecha límite'),
  compensationType: z.string().min(1, 'Elegí una opción'), compensationDetails: z.string().max(500),
  documents: z.string(), procedure: z.string().trim().min(10, 'Explicá cómo postularse (mínimo 10 caracteres)'),
  applicationMode: z.enum(['internal', 'external']), externalUrl: httpsUrl,
})

const checks = [
  (d) => (d.deadline && d.applicationStart && d.deadline < d.applicationStart ? { path: 'deadline', message: 'Tiene que ser posterior a la apertura' } : null),
  (d) => (d.deadline && d.deadline < todayISO() ? { path: 'deadline', message: 'La fecha límite no puede estar en el pasado' } : null),
  (d) => (d.applicationMode === 'external' && !d.externalUrl ? { path: 'externalUrl', message: 'Indicá la URL oficial de postulación' } : null),
]

const empty = {
  title: '', slug: '', organizationName: '', organizationType: '', venueId: '', opportunityType: '', description: '', requirements: '', disciplines: [],
  city: '', scope: '', applicationStart: todayISO(), deadline: '', compensationType: '', compensationDetails: '', documents: '', procedure: '',
  applicationMode: 'internal', externalUrl: '',
}

const toForm = (o) => ({
  ...empty, title: o.title, slug: o.slug, organizationName: o.organizationName, organizationType: o.organizationType, venueId: o.venueId ?? '',
  opportunityType: o.opportunityType, description: o.description, requirements: toLines(o.requirements), disciplines: o.disciplines,
  city: o.location.city ?? '', scope: o.location.scope, applicationStart: o.applicationStart, deadline: o.deadline,
  compensationType: o.compensation.type, compensationDetails: o.compensation.details ?? '', documents: toLines(o.documents), procedure: o.procedure,
  applicationMode: o.applicationMode, externalUrl: o.externalUrl ?? '',
})

const toPayload = (d) => ({
  title: d.title.trim(), slug: d.slug, organizationName: d.organizationName.trim(), organizationType: d.organizationType, venueId: d.venueId || null,
  opportunityType: d.opportunityType, description: d.description.trim(), requirements: fromLines(d.requirements), disciplines: d.disciplines,
  location: { country: 'UY', city: d.city || null, scope: d.scope.trim() },
  applicationStart: d.applicationStart, deadline: d.deadline,
  compensation: { type: d.compensationType, details: d.compensationDetails.trim() }, documents: fromLines(d.documents), procedure: d.procedure.trim(),
  applicationMode: d.applicationMode, externalUrl: d.applicationMode === 'external' ? d.externalUrl : null,
  currency: 'UYU', originVerified: false,
})

export default function OpportunityFormPage() {
  const ctl = usePublicationForm({ schema, checks, emptyValues: empty, toForm, toPayload, service: opportunitiesService, titleField: 'title' })
  useDocumentTitle(ctl.editId ? 'Editar convocatoria' : 'Publicar una convocatoria')
  const { tax } = useTaxonomies()
  const uy = configService.countries()[0]
  const { data: myVenues = [] } = useServiceQuery(() => venuesService.listMine(), [])
  const { register, control, watch, formState: { errors } } = ctl.form
  const mode = watch('applicationMode')

  return (
    <PublicationFormShell ctl={ctl} kindLabel="convocatoria" statusKey="status" title={ctl.editId ? 'Editar convocatoria' : 'Publicá una convocatoria'}
      preview={(d) => <OpportunityCard opportunity={{ ...toPayload(d), id: 'preview', slug: d.slug || 'vista-previa', title: d.title || 'Título', deadline: d.deadline || todayISO(), publicState: 'published' }} />}>
      <FormSection title="La convocatoria">
        <FormField label="Título" required error={errors.title?.message}><Input {...register('title')} /></FormField>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Tipo de convocatoria" required error={errors.opportunityType?.message}><Select placeholder="Elegí" options={tax.opportunityTypes} {...register('opportunityType')} /></FormField>
          <FormField label="Organización convocante" required error={errors.organizationName?.message}><Input {...register('organizationName')} /></FormField>
          <FormField label="Tipo de organización" required error={errors.organizationType?.message}><Select placeholder="Elegí" options={tax.organizationTypes} {...register('organizationType')} /></FormField>
          {myVenues.length > 0 && <FormField label="Sala asociada" hint="Opcional: aparece en la ficha de la sala."><Select placeholder="Ninguna" options={myVenues.map((v) => ({ id: v.id, label: v.name }))} {...register('venueId')} /></FormField>}
        </div>
        <FormField label="Descripción" required error={errors.description?.message}><Textarea rows={5} {...register('description')} /></FormField>
        <FormField label="Requisitos"><Controller control={control} name="requirements" render={({ field }) => <LinesInput {...field} addLabel="Agregar requisito" placeholder="Ej. Obra estrenada" />} /></FormField>
        <Controller control={control} name="disciplines" render={({ field }) => (
          <CheckboxGroup legend="Disciplinas admitidas" required columns={3} options={tax.disciplines} value={field.value} onChange={field.onChange} error={errors.disciplines?.message} />
        )} />
      </FormSection>

      <FormSection title="Lugar, fechas y condiciones">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Ciudad" hint="Vacío si es para todo el país"><Select placeholder="Todo el país" options={uy.cities.map((c) => ({ id: c.name, label: c.name }))} {...register('city')} /></FormField>
          <FormField label="Lugar o alcance" required hint="Ej. Sala Urdimbre, Montevideo" error={errors.scope?.message}><Input {...register('scope')} /></FormField>
          <FormField label="Fecha de apertura" required error={errors.applicationStart?.message}><Input type="date" {...register('applicationStart')} /></FormField>
          <FormField label="Fecha límite" required error={errors.deadline?.message}><Input type="date" min={todayISO()} {...register('deadline')} /></FormField>
          <FormField label="Condiciones económicas" required error={errors.compensationType?.message}><Select placeholder="Elegí" options={tax.compensation} {...register('compensationType')} /></FormField>
        </div>
        <FormField label="Detalle de las condiciones" hint="Montos, porcentajes, apoyos"><Textarea rows={2} {...register('compensationDetails')} /></FormField>
      </FormSection>

      <FormSection title="Postulación">
        <FormField label="Documentación solicitada"><Controller control={control} name="documents" render={({ field }) => <LinesInput {...field} addLabel="Agregar documento" placeholder="Ej. Dossier en PDF" />} /></FormField>
        <FormField label="Procedimiento de postulación" required error={errors.procedure?.message}><Textarea rows={3} {...register('procedure')} /></FormField>
        <FormField label="¿Dónde se postula?" required>
          <Select options={[{ id: 'internal', label: 'Dentro de TRAMA (formulario de postulación)' }, { id: 'external', label: 'En un sitio externo' }]} {...register('applicationMode')} />
        </FormField>
        {mode === 'external' && (
          <FormField label="URL oficial de postulación" required hint="Se muestra claramente como enlace externo." error={errors.externalUrl?.message}><Input placeholder="https://…" {...register('externalUrl')} /></FormField>
        )}
      </FormSection>
    </PublicationFormShell>
  )
}
