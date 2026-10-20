import { Controller } from 'react-hook-form'
import { z } from 'zod'
import { PublicationFormShell, FormSection } from '@/features/publishing/PublicationFormShell'
import { usePublicationForm } from '@/features/publishing/usePublicationForm'
import { toLines, fromLines, emptyToNull, optionalNumber, requiredNumber, slugField, httpsUrl } from '@/features/publishing/formHelpers'
import { LinesInput } from '@/components/forms/LinesInput'
import { FormField, Input, Textarea, Select, CheckboxGroup, Checkbox } from '@/components/forms/FormField'
import { FileUpload } from '@/components/forms/FileUpload'
import { ShowCard, SHOW_AVAILABILITY } from '@/components/cards/ShowCard'
import { showsService, configService } from '@/services'
import { useTaxonomies } from '@/hooks/useTaxonomies'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

const schema = z.object({
  title: z.string().trim().min(2, 'Mínimo 2 caracteres').max(120), slug: slugField,
  company: z.string().trim().min(2, 'Indicá la compañía o responsable'), city: z.string().min(1, 'Elegí la ciudad'),
  synopsis: z.string().trim().min(20, 'Mínimo 20 caracteres').max(300, 'Máximo 300 caracteres'),
  description: z.string().trim().max(3000),
  discipline: z.string().min(1, 'Elegí la disciplina'), genre: z.string().min(1, 'Elegí el género'),
  durationMinutes: requiredNumber('Indicá la duración'), castSize: requiredNumber('Indicá la cantidad de intérpretes'),
  audience: z.string().min(1, 'Elegí el público'), technicalNeeds: z.string().min(1, 'Elegí una opción'), stagingFormat: z.string().min(1, 'Elegí una opción'),
  direction: z.string(), dramaturgy: z.string(), cast: z.string(), production: z.string(), lightingDesign: z.string(), soundDesign: z.string(), set: z.string(), costume: z.string(), others: z.string(),
  setupMinutes: optionalNumber, strikeMinutes: optionalNumber, minWidth: optionalNumber, minDepth: optionalNumber, minHeight: optionalNumber,
  lightingReq: z.string(), soundReq: z.string(), equipment: z.string(), transport: z.string(), touringConditions: z.string(),
  bookingModes: z.array(z.string()).min(1, 'Elegí al menos una modalidad'),
  priceFrom: optionalNumber, priceTo: optionalNumber, feeNotes: z.string().max(500),
  touring: z.boolean(), coproduction: z.boolean(), availability: z.string().min(1),
  videoUrl: httpsUrl, photos: z.array(z.any()), dossier: z.array(z.any()), techSheet: z.array(z.any()),
})

const empty = {
  title: '', slug: '', company: '', city: '', synopsis: '', description: '', discipline: '', genre: '', durationMinutes: '', castSize: '',
  audience: '', technicalNeeds: '', stagingFormat: '', direction: '', dramaturgy: '', cast: '', production: '', lightingDesign: '', soundDesign: '', set: '', costume: '', others: '',
  setupMinutes: '', strikeMinutes: '', minWidth: '', minDepth: '', minHeight: '', lightingReq: '', soundReq: '', equipment: '', transport: '', touringConditions: '',
  bookingModes: [], priceFrom: '', priceTo: '', feeNotes: '', touring: false, coproduction: false, availability: 'disponible',
  videoUrl: '', photos: [], dossier: [], techSheet: [],
}

const toForm = (s) => ({
  ...empty, title: s.title, slug: s.slug, company: s.company, city: s.city, synopsis: s.synopsis, description: s.description,
  discipline: s.discipline, genre: s.genre, durationMinutes: s.durationMinutes, castSize: s.castSize, audience: s.audience,
  technicalNeeds: s.technicalNeeds, stagingFormat: s.stagingFormat,
  direction: s.credits.direction ?? '', dramaturgy: s.credits.dramaturgy ?? '', cast: toLines(s.credits.cast), production: s.credits.production ?? '',
  lightingDesign: s.credits.lighting ?? '', soundDesign: s.credits.sound ?? '', set: s.credits.set ?? '', costume: s.credits.costume ?? '', others: toLines(s.credits.others),
  setupMinutes: s.technicalRider.setupMinutes ?? '', strikeMinutes: s.technicalRider.strikeMinutes ?? '',
  minWidth: s.technicalRider.minStage?.width ?? '', minDepth: s.technicalRider.minStage?.depth ?? '', minHeight: s.technicalRider.minStage?.height ?? '',
  lightingReq: s.technicalRider.lighting ?? '', soundReq: s.technicalRider.sound ?? '', equipment: toLines(s.technicalRider.equipment),
  transport: s.technicalRider.transport ?? '', touringConditions: s.technicalRider.touringConditions ?? '',
  bookingModes: s.bookingModes, priceFrom: s.priceFrom ?? '', priceTo: s.priceTo ?? '', feeNotes: s.feeNotes ?? '',
  touring: s.touring, coproduction: s.coproduction, availability: s.availability, videoUrl: s.media.videoUrl ?? '',
  photos: s.media.photos ?? [],
  // Archivos ya publicados: se muestran como existentes.
  dossier: s.media.dossierUrl ? [{ name: s.media.dossierUrl.split('/').pop(), url: s.media.dossierUrl }] : [],
  techSheet: s.media.technicalSheetUrl ? [{ name: s.media.technicalSheetUrl.split('/').pop(), url: s.media.technicalSheetUrl }] : [],
})

const num = (v) => (v === '' ? null : Number(v))
const toPayload = (d) => ({
  title: d.title.trim(), slug: d.slug, company: d.company.trim(), country: 'UY', city: d.city, synopsis: d.synopsis.trim(), description: d.description.trim(),
  discipline: d.discipline, genre: d.genre, durationMinutes: Number(d.durationMinutes), castSize: Number(d.castSize), audience: d.audience,
  technicalNeeds: d.technicalNeeds, stagingFormat: d.stagingFormat,
  credits: {
    direction: emptyToNull(d.direction), dramaturgy: emptyToNull(d.dramaturgy), cast: fromLines(d.cast), production: emptyToNull(d.production),
    lighting: emptyToNull(d.lightingDesign), sound: emptyToNull(d.soundDesign), set: emptyToNull(d.set), costume: emptyToNull(d.costume), others: fromLines(d.others),
  },
  technicalRider: {
    setupMinutes: num(d.setupMinutes), strikeMinutes: num(d.strikeMinutes), minStage: { width: num(d.minWidth), depth: num(d.minDepth), height: num(d.minHeight) },
    lighting: d.lightingReq, sound: d.soundReq, equipment: fromLines(d.equipment), transport: d.transport, touringConditions: d.touringConditions,
  },
  bookingModes: d.bookingModes, priceFrom: num(d.priceFrom), priceTo: num(d.priceTo), currency: 'UYU', feeNotes: emptyToNull(d.feeNotes),
  touring: d.touring, coproduction: d.coproduction, availability: d.availability,
  // Solo se guardan archivos con una URL real; los elegidos en la demo no se suben.
  media: {
    photos: d.photos.filter((p) => p.url), poster: null, videoUrl: emptyToNull(d.videoUrl),
    dossierUrl: d.dossier.find((f) => f.url)?.url ?? null, technicalSheetUrl: d.techSheet.find((f) => f.url)?.url ?? null,
  },
})

export default function ShowFormPage() {
  const ctl = usePublicationForm({ schema, emptyValues: empty, toForm, toPayload, service: showsService, titleField: 'title' })
  useDocumentTitle(ctl.editId ? 'Editar espectáculo' : 'Publicar un espectáculo')
  const { tax } = useTaxonomies()
  const uy = configService.countries()[0]
  const { register, control, formState: { errors } } = ctl.form

  return (
    <PublicationFormShell ctl={ctl} kindLabel="espectáculo" title={ctl.editId ? 'Editar espectáculo' : 'Publicá tu espectáculo'}
      preview={(d) => <ShowCard show={{ ...toPayload(d), id: 'preview', slug: d.slug || 'vista-previa', title: d.title || 'Título', durationMinutes: Number(d.durationMinutes) || 0, castSize: Number(d.castSize) || 0 }} />}>
      <FormSection title="La obra">
        <FormField label="Título" required error={errors.title?.message}><Input {...register('title')} /></FormField>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Compañía o responsable" required error={errors.company?.message}><Input {...register('company')} /></FormField>
          <FormField label="Ciudad de origen" required error={errors.city?.message}><Select placeholder="Elegí" options={uy.cities.map((c) => ({ id: c.name, label: c.name }))} {...register('city')} /></FormField>
          <FormField label="Disciplina" required error={errors.discipline?.message}><Select placeholder="Elegí" options={tax.disciplines} {...register('discipline')} /></FormField>
          <FormField label="Género" required error={errors.genre?.message}><Select placeholder="Elegí" options={tax.genres} {...register('genre')} /></FormField>
          <FormField label="Duración (minutos)" required error={errors.durationMinutes?.message}><Input type="number" min={1} {...register('durationMinutes')} /></FormField>
          <FormField label="Cantidad de intérpretes" required error={errors.castSize?.message}><Input type="number" min={1} {...register('castSize')} /></FormField>
          <FormField label="Público" required error={errors.audience?.message}><Select placeholder="Elegí" options={tax.audiences} {...register('audience')} /></FormField>
          <FormField label="Disponibilidad" required><Select options={Object.entries(SHOW_AVAILABILITY).map(([id, v]) => ({ id, label: v.label }))} {...register('availability')} /></FormField>
        </div>
        <FormField label="Sinopsis" required hint="Hasta 300 caracteres. Se muestra en la tarjeta." error={errors.synopsis?.message}><Textarea rows={3} {...register('synopsis')} /></FormField>
        <FormField label="Descripción completa" error={errors.description?.message}><Textarea rows={5} {...register('description')} /></FormField>
      </FormSection>

      <FormSection title="Ficha artística">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Dirección"><Input {...register('direction')} /></FormField>
          <FormField label="Dramaturgia"><Input {...register('dramaturgy')} /></FormField>
          <FormField label="Producción"><Input {...register('production')} /></FormField>
          <FormField label="Diseño de iluminación"><Input {...register('lightingDesign')} /></FormField>
          <FormField label="Diseño sonoro"><Input {...register('soundDesign')} /></FormField>
          <FormField label="Escenografía"><Input {...register('set')} /></FormField>
          <FormField label="Vestuario"><Input {...register('costume')} /></FormField>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Elenco"><Controller control={control} name="cast" render={({ field }) => <LinesInput {...field} addLabel="Agregar intérprete" placeholder="Nombre y apellido" />} /></FormField>
          <FormField label="Otros créditos"><Controller control={control} name="others" render={({ field }) => <LinesInput {...field} addLabel="Agregar crédito" placeholder="Ej. Asistencia: Ana Pérez" />} /></FormField>
        </div>
      </FormSection>

      <FormSection title="Ficha técnica">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Necesidades técnicas" required error={errors.technicalNeeds?.message}><Select placeholder="Elegí" options={tax.technicalNeeds} {...register('technicalNeeds')} /></FormField>
          <FormField label="Formato de montaje" required error={errors.stagingFormat?.message}><Select placeholder="Elegí" options={tax.stagingFormats} {...register('stagingFormat')} /></FormField>
          <FormField label="Montaje (minutos)" error={errors.setupMinutes?.message}><Input type="number" min={0} {...register('setupMinutes')} /></FormField>
          <FormField label="Desmontaje (minutos)" error={errors.strikeMinutes?.message}><Input type="number" min={0} {...register('strikeMinutes')} /></FormField>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <FormField label="Ancho mínimo (m)"><Input type="number" step="0.1" {...register('minWidth')} /></FormField>
          <FormField label="Fondo mínimo (m)"><Input type="number" step="0.1" {...register('minDepth')} /></FormField>
          <FormField label="Altura mínima (m)"><Input type="number" step="0.1" {...register('minHeight')} /></FormField>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Requerimientos de iluminación"><Textarea rows={2} {...register('lightingReq')} /></FormField>
          <FormField label="Requerimientos de sonido"><Textarea rows={2} {...register('soundReq')} /></FormField>
          <FormField label="Equipamiento necesario"><Controller control={control} name="equipment" render={({ field }) => <LinesInput {...field} addLabel="Agregar equipo" placeholder="Ej. Máquina de humo" />} /></FormField>
          <FormField label="Transporte"><Textarea rows={2} {...register('transport')} /></FormField>
        </div>
        <FormField label="Condiciones de gira"><Textarea rows={2} {...register('touringConditions')} /></FormField>
      </FormSection>

      <FormSection title="Contratación">
        <Controller control={control} name="bookingModes" render={({ field }) => (
          <CheckboxGroup legend="Formato de contratación" required columns={3} options={tax.bookingModes} value={field.value} onChange={field.onChange} error={errors.bookingModes?.message} />
        )} />
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Caché orientativo desde (UYU)" error={errors.priceFrom?.message}><Input type="number" min={0} {...register('priceFrom')} /></FormField>
          <FormField label="Caché orientativo hasta (UYU)" error={errors.priceTo?.message}><Input type="number" min={0} {...register('priceTo')} /></FormField>
        </div>
        <FormField label="Condiciones adicionales"><Textarea rows={2} {...register('feeNotes')} /></FormField>
        <div className="flex flex-wrap gap-6">
          <Checkbox label="Disponible para giras" {...register('touring')} />
          <Checkbox label="Abierta a coproducción" {...register('coproduction')} />
        </div>
      </FormSection>

      <FormSection title="Materiales" description="En la demo los archivos no se suben: no se muestra un botón de descarga hasta que exista el archivo.">
        <FormField label="Video promocional (URL)" hint="Enlace https a un video público." error={errors.videoUrl?.message}><Input {...register('videoUrl')} /></FormField>
        <Controller control={control} name="photos" render={({ field }) => <FileUpload label="Fotografías y afiche" value={field.value} onChange={field.onChange} />} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Controller control={control} name="dossier" render={({ field }) => <FileUpload label="Dossier (PDF)" accept="application/pdf" maxSizeMB={10} maxFiles={1} value={field.value} onChange={field.onChange} />} />
          <Controller control={control} name="techSheet" render={({ field }) => <FileUpload label="Ficha técnica (PDF)" accept="application/pdf" maxSizeMB={10} maxFiles={1} value={field.value} onChange={field.onChange} />} />
        </div>
      </FormSection>
    </PublicationFormShell>
  )
}
