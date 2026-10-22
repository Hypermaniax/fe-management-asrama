import { useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { LoadingButton } from '@/components/shared/loading-button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'
import type { DocumentSubmission } from '@/features/document/api'
import { useRejectDocument } from '@/features/document/hooks'
import {
  rejectDocumentSchema,
  type RejectDocumentValues,
} from '@/features/document/schema'
import type { ApiEnvelope } from '@/lib/api'
import { formErrorClass } from '@/lib/form'
import { notifyError, notifySuccess } from '@/lib/notify'

export function RejectDocumentDialog({
  open,
  onOpenChange,
  document,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  document?: DocumentSubmission | null
}) {
  const reject = useRejectDocument()

  const form = useForm<RejectDocumentValues>({
    resolver: zodResolver(rejectDocumentSchema),
    defaultValues: { reason: '' },
  })

  useEffect(() => {
    if (open) form.reset({ reason: '' })
  }, [open, form])

  const onSubmit = form.handleSubmit((values) => {
    if (!document) return
    reject.mutate(
      { id: document.id, reason: values.reason },
      {
        onSuccess: (res: ApiEnvelope<DocumentSubmission>) => {
          notifySuccess(res.status, document.documentType?.name)
          onOpenChange(false)
        },
        onError: (error) => notifyError('Gagal menolak dokumen', error),
      },
    )
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tolak dokumen</DialogTitle>
          <DialogDescription>
            {document?.documentType
              ? `Dokumen ${document.documentType.name} akan ditolak.`
              : undefined}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form noValidate onSubmit={onSubmit} className="flex flex-col gap-5">
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Alasan penolakan</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={4}
                      placeholder="mis. berkas tidak terbaca"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className={formErrorClass} />
                </FormItem>
              )}
            />

            <DialogFooter>
              <LoadingButton
                type="submit"
                className="bg-danger text-main-foreground hover:bg-danger"
                loading={reject.isPending}
              >
                Tolak dokumen
              </LoadingButton>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
