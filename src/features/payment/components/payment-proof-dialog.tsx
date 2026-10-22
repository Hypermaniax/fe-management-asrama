import { FilePreviewDialog } from '@/components/shared/file-preview-dialog'

export function PaymentProofDialog({
  open,
  onOpenChange,
  fileId,
  title = 'Bukti pembayaran',
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  fileId: string | null
  title?: string
}) {
  return (
    <FilePreviewDialog
      open={open}
      onOpenChange={onOpenChange}
      fileId={fileId}
      title={title}
      description="Pratinjau berkas bukti pembayaran."
      downloadName="bukti-pembayaran"
      emptyMessage="Pengajuan ini tidak memiliki berkas bukti."
    />
  )
}
