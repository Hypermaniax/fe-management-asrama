import { useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useWatch } from 'react-hook-form'

import { BuildingSelect } from '@/components/shared/building-select'
import { LoadingButton } from '@/components/shared/loading-button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import type { DocumentType } from '@/features/document/api'
import {
  useCreateDocumentType,
  useDocumentTypes,
} from '@/features/document/hooks'
import { formatBytes, formatMimeList, MIME_OPTIONS } from '@/features/document/lib'
import {
  documentTypeSchema,
  type DocumentTypeFormValues,
} from '@/features/document/schema'
import type { ApiEnvelope } from '@/lib/api'
import { formErrorClass } from '@/lib/form'
import { notifyError, notifySuccess } from '@/lib/notify'

const emptyValues: DocumentTypeFormValues = {
  buildingId: '',
  code: '',
  name: '',
  isRequiredByDefault: false,
  maxSizeMb: '5',
  allowedMimeTypes: ['application/pdf'],
  sortOrder: '0',
}

export function DocumentTypesDialog({
  open,
  onOpenChange,
  defaultBuildingId,
  canCreate,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultBuildingId?: string | null
  canCreate: boolean
}) {
  const form = useForm<DocumentTypeFormValues>({
    resolver: zodResolver(documentTypeSchema),
    defaultValues: emptyValues,
  })

  const buildingId = useWatch({ control: form.control, name: 'buildingId' })
  const types = useDocumentTypes(open ? buildingId : null)
  const create = useCreateDocumentType()

  useEffect(() => {
    if (!open) return
    form.reset({ ...emptyValues, buildingId: defaultBuildingId ?? '' })
  }, [open, defaultBuildingId, form])

  const onSubmit = form.handleSubmit((values) => {
    create.mutate(
      {
        buildingId: values.buildingId,
        code: values.code,
        name: values.name,
        isRequiredByDefault: values.isRequiredByDefault,
        allowedMimeTypes: values.allowedMimeTypes,
        maxSizeBytes: Number(values.maxSizeMb) * 1024 * 1024,
        sortOrder: values.sortOrder ? Number(values.sortOrder) : undefined,
      },
      {
        onSuccess: (res: ApiEnvelope<DocumentType>) => {
          notifySuccess(res.status, values.name)
          form.reset({ ...emptyValues, buildingId: values.buildingId })
        },
        onError: (error) => notifyError('Gagal membuat jenis dokumen', error),
      },
    )
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Jenis dokumen</DialogTitle>
          <DialogDescription>
            Kelola jenis dokumen yang dapat diminta untuk penghuni per gedung.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <span className="text-sm font-heading">Gedung</span>
            <BuildingSelect
              value={buildingId || null}
              onValueChange={(value) => form.setValue('buildingId', value)}
            />
          </div>

          {types.isLoading ? (
            <p className="text-sm text-foreground/70">Memuat jenis dokumen…</p>
          ) : (types.data ?? []).length === 0 ? (
            <p className="rounded-base border-2 border-dashed border-border p-4 text-center text-sm text-foreground/70">
              Belum ada jenis dokumen untuk gedung ini.
            </p>
          ) : (
            <ul className="flex flex-col divide-y-2 divide-border border-y-2 border-border">
              {(types.data ?? []).map((type) => (
                <li
                  key={type.id}
                  className="flex flex-wrap items-center gap-3 py-3"
                >
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="font-heading">{type.name}</span>
                    <span className="text-xs text-foreground/60">
                      {type.code} · {formatMimeList(type.allowedMimeTypes)} · maks{' '}
                      {formatBytes(type.maxSizeBytes)}
                    </span>
                  </div>
                  {type.isRequiredByDefault ? (
                    <Badge variant="neutral">Wajib</Badge>
                  ) : null}
                </li>
              ))}
            </ul>
          )}

          {canCreate ? (
            <Form {...form}>
              <form
                noValidate
                onSubmit={onSubmit}
                className="flex flex-col gap-4 rounded-base border-2 border-border bg-secondary-background p-4"
              >
                <span className="font-heading">Tambah jenis baru</span>

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Kode</FormLabel>
                        <FormControl>
                          <Input placeholder="mis. KTP" {...field} />
                        </FormControl>
                        <FormMessage className={formErrorClass} />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nama</FormLabel>
                        <FormControl>
                          <Input placeholder="mis. Kartu Tanda Penduduk" {...field} />
                        </FormControl>
                        <FormMessage className={formErrorClass} />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="maxSizeMb"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ukuran maks (MB)</FormLabel>
                        <FormControl>
                          <Input type="number" min={1} max={10} {...field} />
                        </FormControl>
                        <FormMessage className={formErrorClass} />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="sortOrder"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Urutan</FormLabel>
                        <FormControl>
                          <Input type="number" min={0} {...field} />
                        </FormControl>
                        <FormMessage className={formErrorClass} />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="isRequiredByDefault"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between gap-3">
                      <div className="flex flex-col gap-0.5">
                        <FormLabel>Wajib secara default</FormLabel>
                        <FormDescription>
                          Diminta otomatis untuk penghuni baru.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="allowedMimeTypes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipe berkas diizinkan</FormLabel>
                      <div className="flex flex-wrap gap-4">
                        {MIME_OPTIONS.map((option) => {
                          const checked = field.value.includes(option.value)
                          return (
                            <label
                              key={option.value}
                              className="flex items-center gap-2 text-sm"
                            >
                              <Checkbox
                                checked={checked}
                                onCheckedChange={(next) =>
                                  field.onChange(
                                    next
                                      ? [...field.value, option.value]
                                      : field.value.filter(
                                          (mime) => mime !== option.value,
                                        ),
                                  )
                                }
                              />
                              {option.label}
                            </label>
                          )
                        })}
                      </div>
                      <FormMessage className={formErrorClass} />
                    </FormItem>
                  )}
                />

                <LoadingButton
                  type="submit"
                  className="w-fit"
                  loading={create.isPending}
                  disabled={!buildingId}
                >
                  Tambah jenis dokumen
                </LoadingButton>
              </form>
            </Form>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  )
}
