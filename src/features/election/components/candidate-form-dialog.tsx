import { useMemo } from 'react'
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
import { Input } from '@/components/ui/input'
import {
  NativeSelect,
  NativeSelectOption,
} from '@/components/ui/native-select'
import { Textarea } from '@/components/ui/textarea'
import { useBuildings } from '@/features/building/hooks'
import type {
  ElectionCandidate,
  ElectionDetail,
} from '@/features/election/api'
import { useAddCandidate } from '@/features/election/hooks'
import {
  candidateSchema,
  type CandidateFormValues,
} from '@/features/election/schema'
import { useResidentDirectory } from '@/features/resident/hooks'
import type { ApiEnvelope } from '@/lib/api'
import { formErrorClass } from '@/lib/form'
import { notifyError, notifySuccess } from '@/lib/notify'

export function CandidateFormDialog({
  open,
  onOpenChange,
  election,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  election: ElectionDetail
}) {
  const add = useAddCandidate()
  const buildings = useBuildings()
  const directory = useResidentDirectory(
    (buildings.data ?? []).map((building) => building.id),
  )

  const options = useMemo(
    () =>
      election.buildingId
        ? directory.filter((user) => user.buildingId === election.buildingId)
        : directory,
    [directory, election.buildingId],
  )
  const taken = new Set(election.candidates.map((candidate) => candidate.userId))
  const available = options.filter((user) => !taken.has(user.id))

  const form = useForm<CandidateFormValues>({
    resolver: zodResolver(candidateSchema),
    defaultValues: { userId: '', orderNo: '', vision: '', mission: '' },
  })

  const onSubmit = form.handleSubmit((values) => {
    add.mutate(
      {
        electionId: election.id,
        input: {
          userId: values.userId,
          ...(values.orderNo ? { orderNo: Number(values.orderNo) } : {}),
          ...(values.vision.trim() ? { vision: values.vision.trim() } : {}),
          ...(values.mission.trim() ? { mission: values.mission.trim() } : {}),
        },
      },
      {
        onSuccess: (res: ApiEnvelope<ElectionCandidate>) => {
          notifySuccess(res.status)
          onOpenChange(false)
        },
        onError: (error) => notifyError('Gagal menambah kandidat', error),
      },
    )
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tambah kandidat</DialogTitle>
          <DialogDescription>
            Kandidat harus warga aktif dan belum terdaftar pada pemilihan ini.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form noValidate onSubmit={onSubmit} className="flex flex-col gap-5">
            <FormField
              control={form.control}
              name="userId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Warga</FormLabel>
                  <FormControl>
                    <NativeSelect
                      value={field.value}
                      onChange={field.onChange}
                    >
                      <NativeSelectOption value="">
                        Pilih warga
                      </NativeSelectOption>
                      {available.map((user) => (
                        <NativeSelectOption key={user.id} value={user.id}>
                          {user.name} · {user.email}
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
              name="orderNo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nomor urut</FormLabel>
                  <FormControl>
                    <Input inputMode="numeric" placeholder="Opsional" {...field} />
                  </FormControl>
                  <FormMessage className={formErrorClass} />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="vision"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Visi</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Opsional" {...field} />
                  </FormControl>
                  <FormMessage className={formErrorClass} />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="mission"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Misi</FormLabel>
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
                disabled={add.isPending || available.length === 0}
              >
                Tambah kandidat
              </LoadingButton>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
