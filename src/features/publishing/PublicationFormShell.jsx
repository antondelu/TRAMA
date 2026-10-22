import { Children, useEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, Eye, Save, Send } from 'lucide-react'
import { PageHeader, PageContainer } from '@/components/layout/PageContainer'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { ErrorState, LoadingSkeleton } from '@/components/ui/States'
import { FormError } from '@/components/forms/FormError'
import { DemoNotice } from '@/components/ui/DemoNotice'
import { cn } from '@/utils/format'

export function FormSection({ title, description, children }) {
  return (
    <fieldset className="space-y-4 border-2 border-ink bg-surface p-5 sm:p-6">
      <legend className="sr-only">{title}</legend>
      <div aria-hidden>
        <h2 className="font-display text-2xl font-extrabold leading-none">{title}</h2>
        {description && <p className="mt-0.5 text-sm text-ink-soft">{description}</p>}
      </div>
      {children}
    </fieldset>
  )
}

// Nombres de los campos de un paso: los registrados tienen `name`; las listas, `data-field`.
const fieldNames = (el) => [...new Set([...(el?.querySelectorAll('[name], [data-field]') ?? [])]
  .map((x) => x.getAttribute('name') ?? x.getAttribute('data-field')).filter(Boolean))]

// Marco común: encabezado, estados de carga, barra de acciones fija,
// vista previa y confirmación al salir con cambios sin guardar.
// Cada FormSection es un paso: se ve uno por vez, con el avance arriba. Todos
// quedan montados (ocultos), así el borrador y el envío usan todo el formulario.
export function PublicationFormShell({ title, kindLabel, ctl, preview, statusKey = 'publicationStatus', children }) {
  const [previewOpen, setPreviewOpen] = useState(false)
  const [step, setStep] = useState(0)
  const stepRefs = useRef([])
  const topRef = useRef(null)
  const { editId, loadState, saving, error, blocker, saveDraft, submit, form } = ctl
  const current = loadState.item?.[statusKey]
  const steps = Children.toArray(children).filter(Boolean)
  const last = steps.length - 1
  const { submitCount } = form.formState

  const goTo = (i) => {
    setStep(i)
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
  // "Siguiente" revisa solo los campos de este paso; si falta algo, lleva al primer campo marcado.
  const next = async () => {
    const el = stepRefs.current[step]
    const names = fieldNames(el)
    if (names.length && !(await form.trigger(names))) {
      requestAnimationFrame(() => el?.querySelector('[aria-invalid="true"]')?.focus())
      return
    }
    goTo(step + 1)
  }
  // Si al enviar hay errores, se abre el primer paso que tiene alguno.
  useEffect(() => {
    if (!submitCount) return
    const id = requestAnimationFrame(() => {
      const i = stepRefs.current.findIndex((el) => el?.querySelector('[aria-invalid="true"]'))
      if (i >= 0) setStep(i)
    })
    return () => cancelAnimationFrame(id)
  }, [submitCount, form.formState.errors])

  if (loadState.loading) return <PageContainer className="py-10"><LoadingSkeleton variant="detail" /></PageContainer>
  if (loadState.error) return <PageContainer className="py-16"><ErrorState error={loadState.error} /></PageContainer>

  return (
    <>
      <PageHeader eyebrow={editId ? `Editar ${kindLabel}` : `Publicar ${kindLabel}`} title={title}
        breadcrumbs={[{ label: 'Inicio', to: '/' }, { label: 'Publicar', to: '/publicar' }, { label: kindLabel }]}
        description="Los campos con * son obligatorios para enviar a moderación. Podés guardar un borrador en cualquier momento." />
      <PageContainer narrow className="py-8">
        {current && <p className="mb-4 flex items-center gap-2 text-sm">Estado actual: <StatusBadge status={current} /></p>}
        {current === 'published' && <DemoNotice className="mb-4">Al enviar cambios, la publicación vuelve a moderación y deja de verse hasta que se apruebe.</DemoNotice>}
        {loadState.item?.moderationNote && ['changes_requested', 'rejected'].includes(current) && (
          <p className="mb-4 rounded-lg border border-danger/25 bg-danger-soft px-3 py-2 text-sm text-danger">Nota de moderación: {loadState.item.moderationNote}</p>
        )}
        <form noValidate onSubmit={submit} className="space-y-6">
          <div ref={topRef} className="scroll-mt-24 space-y-3">
            <p className="text-sm font-semibold text-ink-soft" aria-live="polite">Paso {step + 1} de {steps.length}: <span className="text-ink">{steps[step]?.props.title}</span></p>
            <div className="h-2 overflow-hidden bg-line" aria-hidden>
              <div className="h-full bg-ink transition-[width] duration-300" style={{ width: `${((step + 1) / steps.length) * 100}%` }} />
            </div>
            {/* En celular alcanza con "Paso 2 de 5" y la barra: la lista de pasos ocuparía media pantalla. */}
            <ol className="flex flex-wrap gap-2 max-sm:hidden" aria-label="Pasos del formulario">
              {steps.map((s, i) => (
                <li key={s.props.title}>
                  <button type="button" onClick={() => goTo(i)} aria-current={i === step ? 'step' : undefined}
                    className={cn('inline-flex min-h-11 items-center gap-2 border-2 px-3 text-sm font-bold',
                      i === step ? 'border-ink bg-ink text-white' : 'border-line-strong bg-surface text-ink hover:border-ink')}>
                    <span aria-hidden className="data">{i + 1}</span>{s.props.title}
                  </button>
                </li>
              ))}
            </ol>
          </div>
          {steps.map((s, i) => (
            <div key={s.props.title} ref={(el) => { stepRefs.current[i] = el }} hidden={i !== step}>{s}</div>
          ))}
          <div className="flex justify-between gap-2">
            {step > 0 ? <Button variant="secondary" icon={ArrowLeft} onClick={() => goTo(step - 1)}>Anterior</Button> : <span />}
            {step < last
              ? <Button iconRight={ArrowRight} onClick={next}>Siguiente: {steps[step + 1].props.title}</Button>
              : <p className="self-center text-sm text-ink-soft">Último paso: revisá y enviá a moderación.</p>}
          </div>
          <div className="sticky bottom-0 z-20 -mx-4 border-t border-line bg-canvas/95 px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 backdrop-blur sm:mx-0 sm:rounded-xl sm:border">
            <FormError error={error} />
            {Object.keys(form.formState.errors).length > 0 && !error && (
              <p role="alert" className="mb-2 text-sm font-medium text-danger">Revisá los campos marcados en rojo.</p>
            )}
            <div className="flex flex-wrap justify-end gap-2">
              <Button variant="ghost" icon={Eye} onClick={() => setPreviewOpen(true)}>Vista previa</Button>
              <Button variant="secondary" icon={Save} onClick={saveDraft} loading={saving === 'draft'} disabled={Boolean(saving)}>Guardar borrador</Button>
              <Button type="submit" icon={Send} loading={saving === 'submit'} disabled={Boolean(saving)}>Enviar a moderación</Button>
            </div>
          </div>
        </form>
      </PageContainer>
      <Modal open={previewOpen} onClose={() => setPreviewOpen(false)} title="Vista previa" description="Así se va a ver la tarjeta en el catálogo." size="md">
        {previewOpen && preview(form.getValues())}
      </Modal>
      <ConfirmDialog open={blocker.state === 'blocked'} title="¿Salir sin guardar?" description="Tenés cambios que no guardaste. Si salís, se pierden."
        confirmLabel="Salir sin guardar" cancelLabel="Seguir editando" onConfirm={() => blocker.proceed?.()} onCancel={() => blocker.reset?.()} />
    </>
  )
}
