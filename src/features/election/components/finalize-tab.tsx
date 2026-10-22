import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useWatch } from 'react-hook-form'

import { Can } from '@/components/shared/can'
import { EmptyState } from '@/components/shared/empty-state'
import { LoadingButton } from '@/components/shared/loading-button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  NativeSelect,
  NativeSelectOption,
} from '@/components/ui/native-select'
import type { ElectionDetail } from '@/features/election/api'
import { useFinalizeElection } from '@/features/election/hooks'
import { candidateName, sortCandidates } from '@/features/election/lib'
import {
  finalizeSchema,
  type FinalizeFormValues,
} from '@/features/election/schema'
import { usePositions } from '@/features/organization/hooks'
import { notifyError, notifySuccess } from '@/lib/notify'
import { formErrorClass } from '@/lib/form'

export function FinalizeTab({ election }: { election: ElectionDetail }) {
  const positions = usePositions()
  const finalize = useFinalizeElection()

  const form = useForm<FinalizeFormValues>({
    resolver: zodResolver(finalizeSchema),
    defaultValues: { positionId: '', candidateId: '' },
  })

  const positionId = useWatch({ control: form.control, name: 'positionId' })
  const candidates = sortCandidates(election.candidates)
  const selectedPosition = (positions.data ?? []).find(
    (position) => position.id === positionId,
  )

  const onSubmit = form.handleSubmit((values) => {
    finalize.mutate(
      {
        electionId: election.id,
        input: {
          positionId: values.positionId,
          ...(values.candidateId ? { candidateId: values.candidateId } : {}),
        },
      },
      {
        onSuccess: (res) => {
          notifySuccess(res.status, 'Pemenang ditetapkan ke jabatan')
        },
        onError: (error) =>
          notifyError('Gagal finalisasi ke jabatan', error),
      },
    )
  })

  if (!election.periodId) {
    return (
      <EmptyState
        title="Periode belum ditautkan"
        description="Finalisasi ke jabatan memerlukan periode kepengurusan. Ubah pemilihan dan pilih periode terlebih dahulu."
      />
    )
  }

  if (candidates.length === 0) {
    return (
      <EmptyState
        title="Belum ada kandidat"
        description="Tambahkan kandidat terlebih dahulu sebelum finalisasi."
      />
    )
  }

  return (
    <div className="flex max-w-xl flex-col gap-4">
      <p className="text-sm text-foreground/80">
        Tetapkan pemenang pemilihan ke jabatan pada periode{' '}
        <span className="font-heading">{election.period?.name ?? 'terpilih'}</span>.
        Penugasan dibuat untuk warga yang terpilih.
      </p>

      <Can permission="election.UPDATE">
        <Form {...form}>
          <form noValidate onSubmit={onSubmit} className="flex flex-col gap-5">
            <FormField
              control={form.control}
              name="positionId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Jabatan</FormLabel>
                  <FormControl>
                    <NativeSelect value={field.value} onChange={field.onChange}>
                      <NativeSelectOption value="">
                        Pilih jabatan
                      </NativeSelectOption>
                      {(positions.data ?? [])
                        .filter((position) => position.isActive)
                        .map((position) => (
                          <NativeSelectOption
                            key={position.id}
                            value={position.id}
                          >
                            {position.name}
                            {position.role?.name
                              ? ` · role ${position.role.name}`
                              : ''}
                          </NativeSelectOption>
                        ))}
                    </NativeSelect>
                  </FormControl>
                  <FormDescription>
                    {selectedPosition?.role
                      ? 'Warga terpilih akan diberi jabatan ini pada periode aktif terkait.'
                      : 'Pilih jabatan tujuan penugasan pemenang.'}
                  </FormDescription>
                  <FormMessage className={formErrorClass} />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="candidateId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kandidat pemenang</FormLabel>
                  <FormControl>
                    <NativeSelect value={field.value} onChange={field.onChange}>
                      <NativeSelectOption value="">
                        Otomatis (peringkat 1)
                      </NativeSelectOption>
                      {candidates.map((candidate) => (
                        <NativeSelectOption
                          key={candidate.id}
                          value={candidate.id}
                        >
                          {candidate.orderNo ? `${candidate.orderNo}. ` : ''}
                          {candidateName(candidate)}
                        </NativeSelectOption>
                      ))}
                    </NativeSelect>
                  </FormControl>
                  <FormDescription>
                    Kosongkan untuk memakai kandidat dengan peringkat teratas.
                  </FormDescription>
                  <FormMessage className={formErrorClass} />
                </FormItem>
              )}
            />

            <div>
              <LoadingButton
                type="submit"
                loading={finalize.isPending}
                disabled={finalize.isPending}
              >
                Sahkan pemenang
              </LoadingButton>
            </div>
          </form>
        </Form>
      </Can>
    </div>
  )
}
