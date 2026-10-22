import { useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useWatch } from 'react-hook-form'

import { BuildingSelect } from '@/components/shared/building-select'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useDocumentTypes, useRequestDocument } from '@/features/document/hooks'
import {
  requestDocumentSchema,
  type RequestDocumentValues,
} from '@/features/document/schema'
import type { DocumentSubmission } from '@/features/document/api'
import { ResidentSelect } from '@/features/resident/components/resident-select'
import type { ApiEnvelope } from '@/lib/api'
import { formErrorClass } from '@/lib/form'
import { notifyError, notifySuccess } from '@/lib/notify'

const emptyValues: RequestDocumentValues = {
  buildingId: '',
  userId: '',
  documentTypeId: '',
}

export function RequestDocumentDialog({
  open,
  onOpenChange,
  defaultBuildingId,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultBuildingId?: string | null
}) {
  const request = useRequestDocument()

  const form = useForm<RequestDocumentValues>({
    resolver: zodResolver(requestDocumentSchema),
    defaultValues: emptyValues,
  })

  useEffect(() => {
    if (!open) return
    form.reset({ ...emptyValues, buildingId: defaultBuildingId ?? '' })
  }, [open, defaultBuildingId, form])

  const buildingId = useWatch({ control: form.control, name: 'buildingId' })
  const types = useDocumentTypes(buildingId)
  const typeItems = (types.data ?? []).map((type) => ({
    value: type.id,
    label: type.name,
  }))

  const onSubmit = form.handleSubmit((values) => {
    request.mutate(
      { userId: values.userId, documentTypeId: values.documentTypeId },
      {
        onSuccess: (res: ApiEnvelope<DocumentSubmission>) => {
          notifySuccess(res.status)
          onOpenChange(false)
        },
        onError: (error) => notifyError('Gagal meminta dokumen', error),
      },
    )
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Minta dokumen</DialogTitle>
          <DialogDescription>
            Penghuni akan menerima permintaan untuk mengunggah jenis dokumen
            yang dipilih.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form noValidate onSubmit={onSubmit} className="flex flex-col gap-5">
            <FormField
              control={form.control}
              name="buildingId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gedung</FormLabel>
                  <FormControl>
                    <BuildingSelect
                      value={field.value || null}
                      onValueChange={(value) => {
                        field.onChange(value)
                        form.setValue('userId', '')
                        form.setValue('documentTypeId', '')
                      }}
                    />
                  </FormControl>
                  <FormMessage className={formErrorClass} />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="userId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Penghuni</FormLabel>
                  <FormControl>
                    <ResidentSelect
                      buildingId={buildingId}
                      value={field.value}
                      onValueChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage className={formErrorClass} />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="documentTypeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Jenis dokumen</FormLabel>
                  <FormControl>
                    <Select
                      items={typeItems}
                      value={field.value || undefined}
                      onValueChange={(value) =>
                        field.onChange(value as string)
                      }
                      disabled={!buildingId || types.isLoading}
                    >
                      <SelectTrigger className="bg-secondary-background text-foreground">
                        <SelectValue placeholder="Pilih jenis dokumen" />
                      </SelectTrigger>
                      <SelectContent>
                        {typeItems.map((item) => (
                          <SelectItem key={item.value} value={item.value}>
                            {item.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage className={formErrorClass} />
                </FormItem>
              )}
            />

            <DialogFooter>
              <LoadingButton type="submit" loading={request.isPending}>
                Kirim permintaan
              </LoadingButton>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
