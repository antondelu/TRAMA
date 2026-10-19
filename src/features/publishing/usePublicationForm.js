import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useToast } from '@/context/ToastContext'
import { useUnsavedChanges } from '@/hooks/useUnsavedChanges'
import { slugify } from '@/utils/slug'
import { resolverWithChecks } from '@/utils/validation'

// Lógica compartida por los cuatro formularios de publicación:
// carga para editar (?id=), guardar borrador, enviar a moderación,
// errores por campo que vienen del servicio y aviso de cambios sin guardar.
export function usePublicationForm({ schema, checks = [], emptyValues, toForm, toPayload, service, titleField }) {
  const [params] = useSearchParams()
  const editId = params.get('id')
  const navigate = useNavigate()
  const { success } = useToast()
  const [loadState, setLoadState] = useState({ loading: Boolean(editId), error: null, item: null })
  const [saving, setSaving] = useState(null) // 'draft' | 'submit'
  const [error, setError] = useState(null)
  const savedRef = useRef(false)

  const [resolver] = useState(() => (checks.length ? resolverWithChecks(schema, checks) : zodResolver(schema)))
  const form = useForm({ resolver, defaultValues: emptyValues, mode: 'onTouched' })
  const { reset, setError: setFieldError, getValues, setValue, formState } = form

  useEffect(() => {
    if (!editId) return
    let alive = true
    service.getForEdit(editId)
      .then((item) => { if (alive) { reset(toForm(item)); setLoadState({ loading: false, error: null, item }) } })
      .catch((e) => alive && setLoadState({ loading: false, error: e, item: null }))
    return () => { alive = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editId])

  const blocker = useUnsavedChanges(formState.isDirty, savedRef)

  // El slug se completa solo a partir del título mientras esté vacío.
  const fillSlug = () => {
    if (!getValues('slug')) setValue('slug', slugify(getValues(titleField)), { shouldDirty: true })
  }

  async function save(values, submit) {
    setSaving(submit ? 'submit' : 'draft')
    setError(null)
    try {
      const item = await service.save({ ...toPayload(values), id: loadState.item?.id }, { submit })
      savedRef.current = true
      reset(values)
      success(submit ? 'Enviado a moderación' : 'Borrador guardado',
        submit ? 'El equipo de TRAMA lo revisa antes de publicarlo. Te avisamos por notificación.' : 'Podés seguir editándolo cuando quieras.')
      navigate('/mi-cuenta/publicaciones')
      return item
    } catch (e) {
      savedRef.current = false
      for (const [field, message] of Object.entries(e.details ?? {})) setFieldError(field, { message })
      setError(e)
      return null
    } finally {
      setSaving(null)
    }
  }

  return {
    form, editId, loadState, saving, error, blocker, fillSlug,
    // Guardar borrador no exige completar todo: solo el título.
    saveDraft: async () => {
      const ok = await form.trigger([titleField, 'slug'])
      if (ok) await save(getValues(), false)
    },
    submit: form.handleSubmit((values) => save(values, true)),
  }
}
