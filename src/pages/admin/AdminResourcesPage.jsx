import { AdminHeader } from './AdminLayout'
import { ResourceManager } from '@/features/resources/ResourceManager'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

export default function AdminResourcesPage() {
  useDocumentTitle('Recursos')
  return (
    <>
      <AdminHeader title="Gestión editorial de recursos" description="Crear, editar, asociar archivos, configurar acceso, publicar, programar y archivar." />
      <ResourceManager />
    </>
  )
}
