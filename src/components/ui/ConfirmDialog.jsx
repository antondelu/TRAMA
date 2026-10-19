import { Modal } from './Modal'
import { Button } from './Button'

// Confirmación para acciones destructivas o difíciles de deshacer.
export function ConfirmDialog({ open, title, description, confirmLabel = 'Confirmar', cancelLabel = 'Cancelar', tone = 'danger', loading = false, onConfirm, onCancel, children }) {
  return (
    <Modal open={open} onClose={onCancel} title={title} description={description} size="sm"
      footer={(
        <>
          <Button variant="secondary" onClick={onCancel} data-autofocus>{cancelLabel}</Button>
          <Button variant={tone === 'danger' ? 'danger' : 'primary'} loading={loading} onClick={onConfirm}>{confirmLabel}</Button>
        </>
      )}>
      {children}
    </Modal>
  )
}
