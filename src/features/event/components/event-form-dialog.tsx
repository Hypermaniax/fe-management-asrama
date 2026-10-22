import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useWatch } from 'react-hook-form'

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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  NativeSelect,
  NativeSelectOption,
} from '@/components/ui/native-select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { useBuildings } from '@/features/building/hooks'
import type { Event } from '@/features/event/api'
import {
  useCreateEvent,
  useUpdateEvent,
} from '@/features/event/hooks'
import {
  CATEGORY_ITEMS,
  dateTimeInput,
  nowDateTimeInput,
  RECURRENCE_ITEMS,
  toIsoDateTime,
} from '@/features/event/lib'
import {
  eventSchema,
  type EventFormValues,
} from '@/features/event/schema'
import type { ApiEnvelope } from '@/lib/api'
import { formErrorClass } from '@/lib/form'
import { notifyError, notifySuccess } from '@/lib/notify'

function initialValues(event: Event | null): EventFormValues {
  return event
    ? {
        title: event.title,
        description: event.description ?? '',
        category: event.category,
        isAdHoc: event.isAdHoc,
        scope: event.scope,
        buildingId: event.buildingId ?? '',
        startAt: dateTimeInput(event.startAt),
        endAt: event.endAt ? dateTimeInput(event.endAt) : '',
        location: event.location ?? '',
        budgetAmount:
          event.budgetAmount === null ? '' : String(event.budgetAmount),
        isPublic: event.isPublic,
        recurrence: event.recurrence,
      }
    : {
        title: '',
        description: '',
        category: 'RUTIN',
        isAdHoc: false,
        scope: 'ASRAMA',
        buildingId: '',
        startAt: nowDateTimeInput(),
        endAt: '',
        location: '',
        budgetAmount: '',
        isPublic: false,
        recurrence: 'NONE',
      }
}

export function EventFormDialog({
  open,
  onOpenChange,
  event,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  event?: Event | null
}) {
  const value = event ?? null
  const isEdit = Boolean(value)
  const buildings = useBuildings()
  const create = useCreateEvent()
  const update = useUpdateEvent()
  const pending = create.isPending || update.isPending

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: initialValues(value),
  })

  const scope = useWatch({ control: form.control, name: 'scope' })

  const onSubmit = form.handleSubmit((values) => {
    const base = {
      title: values.title.trim(),
      description: values.description.trim(),
      category: values.category,
      scope: values.scope,
      buildingId: values.scope === 'GEDUNG' ? values.buildingId : null,
      startAt: toIsoDateTime(values.startAt),
      endAt: values.endAt ? toIsoDateTime(values.endAt) : null,
      location: values.location.trim(),
      budgetAmount: values.budgetAmount.trim()
        ? Number(values.budgetAmount)
        : null,
      isPublic: values.isPublic,
      recurrence: values.recurrence,
    }

    const onSuccess = (res: ApiEnvelope<Event>) => {
      notifySuccess(res.status, values.title)
      onOpenChange(false)
    }
    const onError = (error: unknown) => notifyError('Gagal menyimpan', error)

    if (value) {
      update.mutate({ id: value.id, input: base }, { onSuccess, onError })
      return
    }

    create.mutate(
      {
        title: base.title,
        category: base.category,
        isAdHoc: values.isAdHoc,
        scope: values.scope,
        startAt: base.startAt,
        isPublic: base.isPublic,
        recurrence: base.recurrence,
        ...(base.description ? { description: base.description } : {}),
        ...(base.buildingId ? { buildingId: base.buildingId } : {}),
        ...(base.endAt ? { endAt: base.endAt } : {}),
        ...(base.location ? { location: base.location } : {}),
        ...(base.budgetAmount !== null
          ? { budgetAmount: base.budgetAmount }
          : {}),
      },
      { onSuccess, onError },
    )
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Ubah kegiatan' : 'Buat kegiatan'}
          </DialogTitle>
          <DialogDescription>
            Kegiatan asrama atau gedung beserta jadwal dan anggarannya.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            noValidate
            onSubmit={onSubmit}
            className="flex max-h-[70vh] flex-col gap-5 overflow-y-auto pr-1"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Judul</FormLabel>
                  <FormControl>
                    <Input placeholder="mis. Yasinan rutin" {...field} />
                  </FormControl>
                  <FormMessage className={formErrorClass} />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Deskripsi</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Opsional" {...field} />
                  </FormControl>
                  <FormMessage className={formErrorClass} />
                </FormItem>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kategori</FormLabel>
                    <FormControl>
                      <NativeSelect
                        value={field.value}
                        onChange={(event) => field.onChange(event.target.value)}
                      >
                        {CATEGORY_ITEMS.map((item) => (
                          <NativeSelectOption
                            key={item.value}
                            value={item.value}
                          >
                            {item.label}
                          </NativeSelectOption>
                        ))}
                      </NativeSelect>
                    </FormControl>
                    <FormMessage className={formErrorClass} />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="scope"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Scope</FormLabel>
                    <FormControl>
                      <NativeSelect
                        value={field.value}
                        onChange={(event) => {
                          field.onChange(event.target.value)
                          if (event.target.value === 'ASRAMA') {
                            form.setValue('buildingId', '')
                          }
                        }}
                      >
                        <NativeSelectOption value="ASRAMA">
                          Asrama
                        </NativeSelectOption>
                        <NativeSelectOption value="GEDUNG">
                          Gedung
                        </NativeSelectOption>
                      </NativeSelect>
                    </FormControl>
                    <FormMessage className={formErrorClass} />
                  </FormItem>
                )}
              />
            </div>

            {scope === 'GEDUNG' ? (
              <FormField
                control={form.control}
                name="buildingId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gedung</FormLabel>
                    <FormControl>
                      <NativeSelect
                        value={field.value}
                        onChange={(event) => field.onChange(event.target.value)}
                      >
                        <NativeSelectOption value="">
                          Pilih gedung
                        </NativeSelectOption>
                        {(buildings.data ?? []).map((building) => (
                          <NativeSelectOption
                            key={building.id}
                            value={building.id}
                          >
                            {building.name}
                          </NativeSelectOption>
                        ))}
                      </NativeSelect>
                    </FormControl>
                    <FormMessage className={formErrorClass} />
                  </FormItem>
                )}
              />
            ) : null}

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="startAt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mulai</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage className={formErrorClass} />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endAt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Selesai</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormDescription>Opsional.</FormDescription>
                    <FormMessage className={formErrorClass} />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lokasi</FormLabel>
                    <FormControl>
                      <Input placeholder="Opsional" {...field} />
                    </FormControl>
                    <FormMessage className={formErrorClass} />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="budgetAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Anggaran</FormLabel>
                    <FormControl>
                      <Input
                        inputMode="numeric"
                        placeholder="Opsional"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className={formErrorClass} />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="recurrence"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pengulangan</FormLabel>
                  <FormControl>
                    <NativeSelect
                      value={field.value}
                      onChange={(event) => field.onChange(event.target.value)}
                    >
                      {RECURRENCE_ITEMS.map((item) => (
                        <NativeSelectOption key={item.value} value={item.value}>
                          {item.label}
                        </NativeSelectOption>
                      ))}
                    </NativeSelect>
                  </FormControl>
                  <FormDescription>
                    Selain "Sekali", sesi dibuat otomatis saat pembuatan
                    kegiatan.
                  </FormDescription>
                  <FormMessage className={formErrorClass} />
                </FormItem>
              )}
            />

            <div className="flex flex-wrap gap-6">
              <FormField
                control={form.control}
                name="isPublic"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center gap-3">
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="m-0">Tampil ke warga</FormLabel>
                  </FormItem>
                )}
              />

              {!isEdit ? (
                <FormField
                  control={form.control}
                  name="isAdHoc"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center gap-3">
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="m-0">Kegiatan ad-hoc</FormLabel>
                    </FormItem>
                  )}
                />
              ) : null}
            </div>

            <DialogFooter>
              <LoadingButton
                type="submit"
                loading={pending}
                disabled={pending}
              >
                {isEdit ? 'Simpan perubahan' : 'Buat kegiatan'}
              </LoadingButton>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
