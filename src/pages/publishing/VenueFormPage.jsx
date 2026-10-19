import { Controller } from 'react-hook-form'
import { z } from 'zod'
import { PublicationFormShell, FormSection } from '@/features/publishing/PublicationFormShell'
import { usePublicationForm } from '@/features/publishing/usePublicationForm'
import { toLines, fromLines, emptyToNull, optionalNumber, requiredNumber, slugField } from '@/features/publishing/formHelpers'
import { FormField, Input, Textarea, Select, CheckboxGroup } from '@/components/forms/FormField'
import { FileUpload } from '@/components/forms/FileUpload'
import { VenueCard } from '@/components/cards/VenueCard'
import { venuesService, configService } from '@/services'
import { useTaxonomies } from '@/hooks/useTaxonomies'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

const schema = z.object({
  name: z.string().trim().min(3, 'Mínimo 3 caracteres').max(100),
  slug: slugField,
  description: z.string().trim().min(30, 'Contá un poco más (mínimo 30 caracteres)').max(2000),
  department: z.string().min(1, 'Elegí el departamento'),
  city: z.string().min(1, 'Elegí la ciudad'),
  area: z.string().trim().max(80),
  capacity: requiredNumber('Indicá la capacidad'),
  venueType: z.string().min(1, 'Elegí el tipo de espacio'),
  photos: z.array(z.any()),
  width: optionalNumber, depth: optionalNumber, height: optionalNumber,
  stageType: z.string().max(200), lighting: z.string(), sound: z.string(), dressingRooms: optionalNumber, otherFacilities: z.string(),
  equipment: z.array(z.string()), accessibility: z.array(z.string()),
  rentalModes: z.array(z.string()).min(1, 'Elegí al menos una modalidad'),
  priceFrom: optionalNumber, priceTo: optionalNumber, priceUnit: z.string(),
  minDuration: z.string().max(80), conditions: z.string().max(2000), includedServices: z.string(), extraCosts: z.string(),
  contactEmail: z.union([z.literal(''), z.string().email('Correo no válido')]), contactPhone: z.string().max(30),
})

const checks = [
  (d) => (d.priceTo !== '' && d.priceFrom !== '' && Number(d.priceTo) < Number(d.priceFrom) ? { path: 'priceTo', message: 'Tiene que ser mayor o igual al precio desde' } : null),
]

const empty = {
  name: '', slug: '', description: '', department: '', city: '', area: '', capacity: '', venueType: '', photos: [],
  width: '', depth: '', height: '', stageType: '', lighting: '', sound: '', dressingRooms: '', otherFacilities: '',
  equipment: [], accessibility: [], rentalModes: [], priceFrom: '', priceTo: '', priceUnit: 'por función',
  minDuration: '', conditions: '', includedServices: '', extraCosts: '', contactEmail: '', contactPhone: '',
}

const toForm = (v) => ({
  ...empty, name: v.name, slug: v.slug, description: v.description, department: v.department, city: v.city, area: v.address?.area ?? '',
  capacity: v.capacity, venueType: v.venueType, photos: v.images ?? [],
  width: v.technicalSpecs.dimensions?.width ?? '', depth: v.technicalSpecs.dimensions?.depth ?? '', height: v.technicalSpecs.dimensions?.height ?? '',
  stageType: v.technicalSpecs.stageType ?? '', lighting: toLines(v.technicalSpecs.lighting), sound: toLines(v.technicalSpecs.sound),
  dressingRooms: v.technicalSpecs.dressingRooms ?? '', otherFacilities: toLines(v.technicalSpecs.otherFacilities),
  equipment: v.equipment, accessibility: v.accessibility, rentalModes: v.rentalModes,
  priceFrom: v.priceFrom ?? '', priceTo: v.priceTo ?? '', priceUnit: v.priceUnit ?? 'por función',
  minDuration: v.minDuration ?? '', conditions: v.conditions ?? '', includedServices: toLines(v.includedServices), extraCosts: toLines(v.extraCosts),
  contactEmail: v.contactPreferences?.email ?? '', contactPhone: v.contactPreferences?.phone ?? '',
})

const num = (v) => (v === '' ? null : Number(v))
const toPayload = (d) => ({
  name: d.name.trim(), slug: d.slug, description: d.description.trim(), country: 'UY', department: d.department, city: d.city,
  address: { area: emptyToNull(d.area.trim()) }, capacity: Number(d.capacity), venueType: d.venueType,
  // Solo las fotos con URL (las que tienen vista previa); ver utils/image.js.
  images: d.photos.filter((p) => p.url),
  technicalSpecs: {
    dimensions: { width: num(d.width), depth: num(d.depth), height: num(d.height) }, stageType: d.stageType,
    lighting: fromLines(d.lighting), sound: fromLines(d.sound), dressingRooms: num(d.dressingRooms), otherFacilities: fromLines(d.otherFacilities),
  },
  equipment: d.equipment, accessibility: d.accessibility, rentalModes: d.rentalModes,
  priceFrom: num(d.priceFrom), priceTo: num(d.priceTo ?? d.priceFrom), priceUnit: d.priceUnit, currency: 'UYU',
  minDuration: d.minDuration, conditions: d.conditions, includedServices: fromLines(d.includedServices), extraCosts: fromLines(d.extraCosts),
  // Datos de contacto privados: no se muestran en la ficha pública.
  contactPreferences: { viaPlatform: true, email: emptyToNull(d.contactEmail), phone: emptyToNull(d.contactPhone) },
})

export default function VenueFormPage() {
  const ctl = usePublicationForm({ schema, checks, emptyValues: empty, toForm, toPayload, service: venuesService, titleField: 'name' })
  useDocumentTitle(ctl.editId ? 'Editar sala' : 'Registrar una sala')
  const { tax } = useTaxonomies()
  const uy = configService.countries()[0]
  const { register, control, watch, setValue, formState: { errors } } = ctl.form
  const department = watch('department')
  const cities = uy.cities.filter((c) => !department || c.department === department)

  return (
    <PublicationFormShell ctl={ctl} kindLabel="sala" title={ctl.editId ? 'Editar sala' : 'Registrá tu sala'}
      preview={(d) => <VenueCard venue={{ ...toPayload(d), id: 'preview', slug: d.slug || 'vista-previa', name: d.name || 'Nombre de la sala', hasOpenCall: false, nextAvailable: null }} />}>
      <FormSection title="Datos principales">
        <FormField label="Nombre" required error={errors.name?.message}><Input {...register('name', { onBlur: ctl.fillSlug })} /></FormField>
        <FormField label="Dirección en TRAMA (slug)" hint={`trama.uy/salas/${watch('slug') || 'nombre-de-la-sala'}`} error={errors.slug?.message}><Input {...register('slug')} /></FormField>
        <FormField label="Descripción" required error={errors.description?.message}><Textarea rows={4} {...register('description')} /></FormField>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Departamento" required error={errors.department?.message}><Select placeholder="Elegí" options={uy.departments.map((d) => ({ id: d, label: d }))} {...register('department', { onChange: () => setValue('city', '') })} /></FormField>
          <FormField label="Ciudad" required error={errors.city?.message}><Select placeholder="Elegí" options={cities.map((c) => ({ id: c.name, label: c.name }))} {...register('city')} /></FormField>
          <FormField label="Zona o barrio" hint="Ubicación general. La dirección exacta se comparte al confirmar." error={errors.area?.message}><Input {...register('area')} /></FormField>
          <FormField label="Capacidad (personas)" required error={errors.capacity?.message}><Input type="number" min={1} {...register('capacity')} /></FormField>
          <FormField label="Tipo de espacio" required error={errors.venueType?.message}><Select placeholder="Elegí" options={tax.venueTypes} {...register('venueType')} /></FormField>
        </div>
        <Controller control={control} name="photos" render={({ field }) => (
          <FileUpload label="Fotografías" value={field.value} onChange={field.onChange} hint="JPG, PNG o WebP de hasta 5 MB. En la demo quedan guardadas solo en esta pestaña." />
        )} />
      </FormSection>

      <FormSection title="Características técnicas" description="Una línea por elemento en las listas.">
        <div className="grid gap-4 sm:grid-cols-3">
          <FormField label="Ancho (m)" error={errors.width?.message}><Input type="number" step="0.1" {...register('width')} /></FormField>
          <FormField label="Fondo (m)" error={errors.depth?.message}><Input type="number" step="0.1" {...register('depth')} /></FormField>
          <FormField label="Altura (m)" error={errors.height?.message}><Input type="number" step="0.1" {...register('height')} /></FormField>
        </div>
        <FormField label="Tipo de escenario"><Input {...register('stageType')} /></FormField>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Iluminación"><Textarea rows={3} {...register('lighting')} /></FormField>
          <FormField label="Sonido"><Textarea rows={3} {...register('sound')} /></FormField>
          <FormField label="Camerinos" error={errors.dressingRooms?.message}><Input type="number" min={0} {...register('dressingRooms')} /></FormField>
          <FormField label="Otras instalaciones"><Textarea rows={3} {...register('otherFacilities')} /></FormField>
        </div>
        <Controller control={control} name="equipment" render={({ field }) => <CheckboxGroup legend="Equipamiento" columns={3} options={tax.equipment} value={field.value} onChange={field.onChange} />} />
        <Controller control={control} name="accessibility" render={({ field }) => <CheckboxGroup legend="Accesibilidad" options={tax.accessibility} value={field.value} onChange={field.onChange} />} />
      </FormSection>

      <FormSection title="Condiciones de alquiler">
        <Controller control={control} name="rentalModes" render={({ field }) => (
          <CheckboxGroup legend="Modalidades de alquiler" required columns={3} options={tax.rentalModes} value={field.value} onChange={field.onChange} error={errors.rentalModes?.message} />
        )} />
        <div className="grid gap-4 sm:grid-cols-3">
          <FormField label="Precio desde (UYU)" error={errors.priceFrom?.message}><Input type="number" min={0} {...register('priceFrom')} /></FormField>
          <FormField label="Precio hasta (UYU)" error={errors.priceTo?.message}><Input type="number" min={0} {...register('priceTo')} /></FormField>
          <FormField label="Unidad"><Select options={['por función', 'por día', 'por hora', 'por temporada'].map((u) => ({ id: u, label: u }))} {...register('priceUnit')} /></FormField>
        </div>
        <FormField label="Duración mínima" hint="Ej. 2 funciones, 4 horas"><Input {...register('minDuration')} /></FormField>
        <FormField label="Condiciones de uso"><Textarea rows={3} {...register('conditions')} /></FormField>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Servicios incluidos"><Textarea rows={3} {...register('includedServices')} /></FormField>
          <FormField label="Gastos adicionales"><Textarea rows={3} {...register('extraCosts')} /></FormField>
        </div>
      </FormSection>

      <FormSection title="Contacto y calendario" description="Las consultas llegan por mensajes de TRAMA. Estos datos son privados.">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Correo de reservas (privado)" error={errors.contactEmail?.message}><Input type="email" {...register('contactEmail')} /></FormField>
          <FormField label="Teléfono (privado)"><Input type="tel" {...register('contactPhone')} /></FormField>
        </div>
        <p className="text-sm text-ink-soft">La disponibilidad se carga después, desde Mi cuenta › Calendario, cuando la sala esté publicada.</p>
      </FormSection>
    </PublicationFormShell>
  )
}
