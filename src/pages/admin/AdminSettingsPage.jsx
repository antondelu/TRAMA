import { useState } from 'react'
import { Plus } from 'lucide-react'
import { AdminHeader } from './AdminLayout'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/StatusBadge'
import { Accordion, AccordionItem } from '@/components/ui/Accordion'
import { FormError } from '@/components/forms/FormError'
import { inputClasses } from '@/components/forms/FormField'
import { configService, EDITABLE_TAXONOMIES } from '@/services'
import { useTaxonomies } from '@/hooks/useTaxonomies'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useToast } from '@/context/ToastContext'
import { INTEGRATIONS } from '@/config/integrations'
import { APP, LOCALE } from '@/config/app'

function AddValue({ taxonomyKey, label }) {
  const { success } = useToast()
  const [value, setValue] = useState('')
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)
  async function onSubmit(e) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      await configService.addValue(taxonomyKey, value)
      success('Valor agregado', `${label}: ${value}`)
      setValue('')
    } catch (err) {
      setError(err)
    } finally {
      setBusy(false)
    }
  }
  return (
    <form onSubmit={onSubmit} className="mt-3 space-y-2">
      <div className="flex gap-2">
        <label htmlFor={`add-${taxonomyKey}`} className="sr-only">Nuevo valor para {label}</label>
        <input id={`add-${taxonomyKey}`} value={value} onChange={(e) => setValue(e.target.value)} placeholder="Nuevo valor" className={inputClasses(false)} maxLength={60} />
        <Button type="submit" icon={Plus} loading={busy} disabled={!value.trim()}>Agregar</Button>
      </div>
      <FormError error={error} />
    </form>
  )
}

export default function AdminSettingsPage() {
  useDocumentTitle('Configuración')
  const { tax } = useTaxonomies()
  return (
    <>
      <AdminHeader title="Configuración general" description="Catálogos configurables, región e integraciones." />
      <section className="mb-8">
        <h2 className="mb-3 font-display text-2xl font-semibold">Catálogos</h2>
        <p className="mb-3 text-sm text-ink-soft">Los valores nuevos aparecen en filtros y formularios. Los existentes no se borran para no romper publicaciones que los usan.</p>
        <Accordion>
          {Object.entries(EDITABLE_TAXONOMIES).map(([key, label]) => (
            <AccordionItem key={key} title={`${label} (${tax[key].length})`}>
              <div className="flex flex-wrap gap-1.5">{tax[key].map((v) => <Badge key={v.id}>{v.label}</Badge>)}</div>
              <AddValue taxonomyKey={key} label={label} />
            </AccordionItem>
          ))}
        </Accordion>
      </section>
      <section className="mb-8 rounded-[var(--radius-card)] border border-line bg-surface p-5">
        <h2 className="font-semibold">Región</h2>
        <p className="mt-1 text-sm text-ink-soft">País inicial: Uruguay · Moneda: {LOCALE.currency} · Zona horaria: {LOCALE.timezone} · Idioma: {LOCALE.language}</p>
        <p className="mt-1 text-xs text-ink-soft">Para sumar países, agregalos en src/constants/taxonomies.js (COUNTRIES). El modelo de datos ya guarda país y moneda en cada publicación.</p>
      </section>
      <section className="rounded-[var(--radius-card)] border border-line bg-surface p-5">
        <h2 className="font-semibold">Integraciones</h2>
        <ul className="mt-3 space-y-2 text-sm">
          <li className="flex flex-wrap items-center gap-2"><Badge tone={APP.demoMode ? 'warning' : 'success'}>{APP.demoMode ? 'Modo demo' : 'API conectada'}</Badge>Datos: {APP.demoMode ? 'adaptador local de demostración (sessionStorage)' : APP.apiUrl}</li>
          <li className="flex flex-wrap items-center gap-2"><Badge tone="info">Requiere api/server.mjs</Badge>Formulario de contacto por SMTP</li>
          {['auth', 'payments', 'storage', 'email'].map((k) => (
            <li key={k} className="flex flex-wrap items-center gap-2"><Badge>Pendiente</Badge>{INTEGRATIONS[k].note}</li>
          ))}
        </ul>
      </section>
    </>
  )
}
