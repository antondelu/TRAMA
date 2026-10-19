import { useId, useRef, useState } from 'react'
import { UploadCloud, FileText, X } from 'lucide-react'
import { cn } from '@/utils/format'

const MB = 1024 * 1024

// Selector de archivos con límite de tipo y tamaño. En modo demo los archivos
// NO se suben a ningún servidor: solo se guarda el nombre para la vista previa.
// La subida real necesita un servicio de almacenamiento (ver docs/INTEGRACIONES.md).
export function FileUpload({ label, accept = 'image/jpeg,image/png,image/webp', maxSizeMB = 5, maxFiles = 6, value = [], onChange, hint }) {
  const id = useId()
  const inputRef = useRef(null)
  const [error, setError] = useState('')
  const allowed = accept.split(',').map((s) => s.trim())

  function onFiles(fileList) {
    setError('')
    const next = [...value]
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
      next.push({ name: file.name, size: file.size, type: file.type, pendingUpload: true })
    }
    onChange(next)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-semibold">{label}</label>
      <label htmlFor={id}
        className="flex cursor-pointer flex-col items-center gap-1 rounded-lg border border-dashed border-line-strong bg-surface px-4 py-6 text-center text-sm hover:border-brand"
        onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); onFiles(e.dataTransfer.files) }}>
        <UploadCloud aria-hidden className="size-6 text-ink-soft" />
        <span className="font-semibold text-brand">Elegir archivos</span>
        <span className="text-xs text-ink-soft">{hint ?? `Hasta ${maxFiles} archivos de ${maxSizeMB} MB como máximo.`}</span>
      </label>
      <input ref={inputRef} id={id} type="file" multiple={maxFiles > 1} accept={accept} className="sr-only" onChange={(e) => onFiles(e.target.files)} />
      {error && <p role="alert" className="text-xs font-medium text-danger">{error}</p>}
      {value.length > 0 && (
        <ul className="space-y-1.5">
          {value.map((f, i) => (
            <li key={`${f.name}-${i}`} className={cn('flex items-center gap-2 rounded-md border border-line bg-canvas px-3 py-2 text-sm')}>
              <FileText aria-hidden className="size-4 text-ink-soft" />
              <span className="min-w-0 flex-1 truncate">{f.name}</span>
              {f.pendingUpload && <span className="text-xs text-warning">Sin subir (demo)</span>}
              <button type="button" onClick={() => onChange(value.filter((_, j) => j !== i))} aria-label={`Quitar ${f.name}`} className="rounded p-1 text-ink-soft hover:text-danger">
                <X aria-hidden className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
