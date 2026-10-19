import { AccountHeader } from './AccountLayout'
import { ResourceManager } from '@/features/resources/ResourceManager'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

export default function ResourceManagementPage() {
  useDocumentTitle('Gestión de recursos')
  return (
    <>
      <AccountHeader title="Gestión de recursos" description="Biblioteca editorial: borradores, publicaciones y archivo." />
      <ResourceManager />
    </>
  )
}
