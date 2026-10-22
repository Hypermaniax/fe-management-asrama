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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import type { EventSession } from '@/features/event/api'
import {
  useAddSession,
  useGenerateSessions,
} from '@/features/event/hooks'
import {
  nowDateTimeInput,
  toIsoDate,
  toIsoDateTime,
  todayDateInput,
} from '@/features/event/lib'
import {
  generateSessionsSchema,
  sessionSchema,
  type GenerateSessionsFormValues,
  type SessionFormValues,
} from '@/features/event/schema'
import type { ApiEnvelope } from '@/lib/api'
import { formErrorClass } from '@/lib/form'
import { notifyError, notifySuccess } from '@/lib/notify'

export function AddSessionDialog({
  open,
  onOpenChange,
  eventId,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  eventId: string
}) {
  const add = useAddSession()
  const form = useForm<SessionFormValues>({
    resolver: zodResolver(sessionSchema),
    defaultValues: {
      title: '',
      scheduledAt: nowDateTimeInput(),
      location: '',
      note: '',
    },
  })

  const onSubmit = form.handleSubmit((values) => {
    add.mutate(
      {
        eventId,
        input: {
          scheduledAt: toIsoDateTime(values.scheduledAt),
          ...(values.title.trim() ? { title: values.title.trim() } : {}),
          ...(values.location.trim()
            ? { location: values.location.trim() }
            : {}),
          ...(values.note.trim() ? { note: values.note.trim() } : {}),
        },
      },
      {
        onSuccess: (res: ApiEnvelope<EventSession>) => {
          notifySuccess(res.status)
          onOpenChange(false)
        },
        onError: (error) => notifyError('Gagal menambah sesi', error),
      },
    )
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tambah sesi</DialogTitle>
          <DialogDescription>
            Satu sesi mewakili satu agenda/jadwal pertemuan.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form noValidate onSubmit={onSubmit} className="flex flex-col gap-5">
            <FormField
              control={form.control}
              name="scheduledAt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Jadwal</FormLabel>
                  <FormControl>
                    <Input type="datetime-local" {...field} />
                  </FormControl>
                  <FormMessage className={formErrorClass} />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Judul sesi</FormLabel>
                  <FormControl>
                    <Input placeholder="Opsional" {...field} />
                  </FormControl>
                  <FormMessage className={formErrorClass} />
                </FormItem>
              )}
            />

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
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Catatan</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Opsional" {...field} />
                  </FormControl>
                  <FormMessage className={formErrorClass} />
                </FormItem>
              )}
            />

            <DialogFooter>
              <LoadingButton
                type="submit"
                loading={add.isPending}
                disabled={add.isPending}
              >
                Tambah sesi
              </LoadingButton>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export function GenerateSessionsDialog({
  open,
  onOpenChange,
  eventId,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  eventId: string
}) {
  const generate = useGenerateSessions()
  const form = useForm<GenerateSessionsFormValues>({
    resolver: zodResolver(generateSessionsSchema),
    defaultValues: { datesText: todayDateInput() },
  })

  const onSubmit = form.handleSubmit((values) => {
    const dates = values.datesText
      .split(/\n+/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map(toIsoDate)

    generate.mutate(
      { eventId, dates },
      {
        onSuccess: (res: ApiEnvelope<EventSession[]>) => {
          notifySuccess(
            res.status,
            res.data.length > 0
              ? `${res.data.length} sesi dibuat`
              : 'Semua tanggal sudah memiliki sesi',
          )
          onOpenChange(false)
        },
        onError: (error) => notifyError('Gagal membuat sesi', error),
      },
    )
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Generate sesi</DialogTitle>
          <DialogDescription>
            Masukkan satu tanggal per baris dengan format YYYY-MM-DD.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form noValidate onSubmit={onSubmit} className="flex flex-col gap-5">
            <FormField
              control={form.control}
              name="datesText"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tanggal</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={6}
                      placeholder={'2026-11-01\n2026-11-08\n2026-11-15'}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Tanggal yang sudah punya sesi akan dilewati.
                  </FormDescription>
                  <FormMessage className={formErrorClass} />
                </FormItem>
              )}
            />

            <DialogFooter>
              <LoadingButton
                type="submit"
                loading={generate.isPending}
                disabled={generate.isPending}
              >
                Generate sesi
              </LoadingButton>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
