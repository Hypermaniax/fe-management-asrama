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
import type { Resident } from '@/features/resident/api'
import { useRejectResident } from '@/features/resident/hooks'
import {
  rejectResidentSchema,
  type RejectResidentValues,
} from '@/features/resident/schema'
import type { ApiEnvelope } from '@/lib/api'
import { formErrorClass } from '@/lib/form'
import { notifyError, notifySuccess } from '@/lib/notify'

export function RejectResidentDialog({
  open,
  onOpenChange,
  resident,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  resident?: Resident | null
}) {
  const reject = useRejectResident()

  const form = useForm<RejectResidentValues>({
    resolver: zodResolver(rejectResidentSchema),
    defaultValues: { reason: '' },
  })

  useEffect(() => {
    if (open) form.reset({ reason: '' })
  }, [open, form])

  const onSubmit = form.handleSubmit((values) => {
    if (!resident) return
    reject.mutate(
      { id: resident.id, reason: values.reason },
      {
        onSuccess: (res: ApiEnvelope<Resident>) => {
          notifySuccess(res.status, resident.name ?? resident.email)
          onOpenChange(false)
        },
        onError: (error) => notifyError('Gagal menolak pendaftaran', error),
      },
    )
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tolak pendaftaran</DialogTitle>
          <DialogDescription>
            {resident
              ? `Pendaftaran ${resident.name ?? resident.email} akan ditolak.`
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
                      placeholder="Jelaskan alasan penolakan agar pendaftar dapat memperbaiki."
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
                Tolak pendaftaran
              </LoadingButton>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
