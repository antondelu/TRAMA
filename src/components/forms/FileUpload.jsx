import { useId, useRef, useState } from 'react'
import { UploadCloud, FileText, X, Star } from 'lucide-react'
import { ImageFramer } from './ImageFramer'
import { readImage, focusStyle, DEFAULT_FOCUS } from '@/utils/image'
import { cn } from '@/utils/format'

const MB = 1024 * 1024

// En la demo los PDF también se guardan como data URL, para poder descargarlos.
const readAsDataUrl = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader()
  reader.onload = () => resolve(reader.result)
  reader.onerror = () => reject(reader.error)
  reader.readAsDataURL(file)
})

// Las fotos con URL se muestran y se pueden encuadrar; el resto (PDF) va en lista.
const isImage = (f) => Boolean(f.url) && !f.type?.startsWith('application/')

// Selector de archivos con límite de tipo y tamaño. En modo demo los archivos
// NO se suben a ningún servidor: se guardan junto con la publicación (las fotos,
// achicadas; ver utils/image.js).
// La subida real necesita un servicio de almacenamiento (ver docs/INTEGRACIONES.md).
// La primera foto es la portada: se encuadra en `frameRatio`, el recuadro de la tarjeta.
// Con maxFiles={1}, elegir otro archivo reemplaza al anterior.
export function FileUpload({ label, accept = 'image/jpeg,image/png,image/webp', maxSizeMB = 5, maxFiles = 6, value = [], onChange, hint, frameRatio = 'aspect-[4/3]' }) {
  const id = useId()
  const inputRef = useRef(null)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState(0)
  const allowed = accept.split(',').map((s) => s.trim())

  async function onFiles(fileList) {
    setError('')
    const single = maxFiles === 1
    const next = single ? [] : [...value]
    for (const file of fileList) {
      if (!allowed.some((type) => (type.endsWith('/*') ? file.type.startsWith(type.slice(0, -1)) : file.type === type))) {
        setError(`"${file.name}" no es un tipo de archivo permitido.`)
        continue
      }
      if (file.size > maxSizeMB * MB) {
        setError(`"${file.name}" pesa más de ${maxSizeMB} MB.`)
        continue
      }
      if (next.length >= maxFiles) {
        setError(`Podés adjuntar hasta ${maxFiles} archivos.`)
        break
      }
      const item = { name: file.name, size: file.size, type: file.type, pendingUpload: true }
      if (file.type.startsWith('image/')) {
        try {
          Object.assign(item, await readImage(file), { focus: { ...DEFAULT_FOCUS } })
        } catch {
          // Sin vista previa: queda en la lista como cualquier otro archivo.
        }
      } else {
        try {
          item.url = await readAsDataUrl(file)
        } catch {
          // Sin contenido: solo se guarda el nombre.
        }
      }
      next.push(item)
    }
    onChange(next)
    if (inputRef.current) inputRef.current.value = ''
  }

  const update = (i, patch) => onChange(value.map((f, j) => (j === i ? { ...f, ...patch } : f)))
  const remove = (i) => {
    onChange(value.filter((_, j) => j !== i))
    setSelected((s) => (s > i ? s - 1 : s === i ? 0 : s))
  }
  const makeCover = (i) => {
    onChange([value[i], ...value.filter((_, j) => j !== i)])
    setSelected(0)
  }

  const images = value.map((f, i) => ({ f, i })).filter(({ f }) => isImage(f))
  const files = value.map((f, i) => ({ f, i })).filter(({ f }) => !isImage(f))
  const current = images.find(({ i }) => i === selected) ?? images[0]
  const coverIndex = images[0]?.i
  const single = maxFiles === 1

  return (
    <div className="space-y-3">
      <label htmlFor={id} className="block text-sm font-semibold">{label}</label>
      <label htmlFor={id}
        className="flex cursor-pointer flex-col items-center gap-1 rounded-lg border border-dashed border-line-strong bg-surface px-4 py-6 text-center text-sm hover:border-brand"
        onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); onFiles(e.dataTransfer.files) }}>
        <UploadCloud aria-hidden className="size-6 text-ink-soft" />
        <span className="font-semibold text-brand">{single ? (value.length ? 'Cambiar archivo' : 'Elegir archivo') : 'Elegir archivos'}</span>
        <span className="text-xs text-ink-soft">{hint ?? `Hasta ${maxFiles} archivos de ${maxSizeMB} MB como máximo.`}</span>
      </label>
      <input ref={inputRef} id={id} type="file" multiple={maxFiles > 1} accept={accept} className="sr-only" onChange={(e) => onFiles(e.target.files)} />
      {error && <p role="alert" className="text-sm font-medium text-danger">{error}</p>}

      {current && (
        <div className="grid gap-4 rounded-lg border border-line bg-canvas p-3 sm:grid-cols-[minmax(0,18rem)_1fr]">
          <ImageFramer image={current.f} ratio={frameRatio} onChange={(focus) => update(current.i, { focus })}
            label={single ? 'Así se ve en la tarjeta' : current.i === coverIndex ? 'Portada · así se ve en la tarjeta' : 'Encuadre de la foto'} />
          <div className="space-y-3">
            <p className="text-sm text-ink-soft">
              Arrastrá la foto dentro del recuadro para elegir qué parte se ve, y acercala con el zoom.
              {!single && ' La primera foto es la portada de la tarjeta.'}
            </p>
            {single && (
              <button type="button" onClick={() => remove(current.i)}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-soft hover:text-danger">
                <X aria-hidden className="size-4" /> Quitar
              </button>
            )}
            {!single && current.i !== coverIndex && (
              <button type="button" onClick={() => makeCover(current.i)}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand hover:underline">
                <Star aria-hidden className="size-4" /> Usar como portada
              </button>
            )}
            {!single && <ul className="flex flex-wrap gap-2" aria-label="Fotos cargadas">
              {images.map(({ f, i }) => (
                <li key={`${f.name ?? f.url.slice(-24)}-${i}`} className="relative">
                  <button type="button" onClick={() => setSelected(i)} aria-label={`Encuadrar ${f.name ?? `foto ${i + 1}`}`} aria-pressed={i === current.i}
                    className={cn('block size-16 overflow-hidden rounded-md border-2', i === current.i ? 'border-brand' : 'border-transparent hover:border-line-strong')}>
                    <img src={f.url} alt="" style={focusStyle(f.focus)} className="size-full object-cover" />
                  </button>
                  {i === coverIndex && <span className="pointer-events-none absolute bottom-1 left-1 rounded bg-brand px-1 text-[10px] font-semibold text-white">Portada</span>}
                  <button type="button" onClick={() => remove(i)} aria-label={`Quitar ${f.name ?? `foto ${i + 1}`}`}
                    className="absolute -right-1.5 -top-1.5 border border-line bg-surface p-0.5 text-ink-soft shadow-sm hover:text-danger">
                    <X aria-hidden className="size-3.5" />
                  </button>
                </li>
              ))}
            </ul>}
          </div>
        </div>
      )}

      {files.length > 0 && (
        <ul className="space-y-1.5">
          {files.map(({ f, i }) => (
            <li key={`${f.name}-${i}`} className="flex items-center gap-2 rounded-md border border-line bg-canvas px-3 py-2 text-sm">
              <FileText aria-hidden className="size-4 text-ink-soft" />
              <span className="min-w-0 flex-1 truncate">{f.name}</span>
              {f.pendingUpload && !f.url && <span className="text-xs text-warning">Sin subir (demo)</span>}
              <button type="button" onClick={() => remove(i)} aria-label={`Quitar ${f.name}`} className="rounded p-1 text-ink-soft hover:text-danger">
                <X aria-hidden className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
