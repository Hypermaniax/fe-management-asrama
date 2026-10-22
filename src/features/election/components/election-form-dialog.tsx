import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useWatch } from 'react-hook-form'
import { Check } from 'lucide-react'

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
import { dateTimeInput, toIsoDateTime } from '@/features/event/lib'
import type { Election } from '@/features/election/api'
import {
  useCreateElection,
  useUpdateElection,
} from '@/features/election/hooks'
import {
  electionSchema,
  type ElectionFormValues,
} from '@/features/election/schema'
import { usePeriods } from '@/features/organization/hooks'
import { useCan } from '@/lib/rbac'
import { useRoles } from '@/features/rbac/hooks'
import type { ApiEnvelope } from '@/lib/api'
import { formErrorClass } from '@/lib/form'
import { notifyError, notifySuccess } from '@/lib/notify'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

function initialValues(election: Election | null): ElectionFormValues {
  return election
    ? {
        code: election.code,
        title: election.title,
        description: election.description ?? '',
        buildingId: election.buildingId ?? '',
        periodId: election.periodId ?? '',
        startAt: dateTimeInput(election.startAt),
        endAt: dateTimeInput(election.endAt),
        allowAbstain: election.allowAbstain,
        eligibleRoleIds: [],
      }
    : {
        code: '',
        title: '',
        description: '',
        buildingId: '',
        periodId: '',
        startAt: dateTimeInput(new Date().toISOString()),
        endAt: dateTimeInput(new Date(Date.now() + 604_800_000).toISOString()),
        allowAbstain: true,
        eligibleRoleIds: [],
      }
}

export function ElectionFormDialog({
  open,
  onOpenChange,
  election,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  election?: Election | null
}) {
  const value = election ?? null
  const isEdit = Boolean(value)
  const buildings = useBuildings()
  const periods = usePeriods()
  const canReadRoles = useCan('role.READ')
  const roles = useRoles(canReadRoles)
  const create = useCreateElection()
  const update = useUpdateElection()
  const pending = create.isPending || update.isPending

  const form = useForm<ElectionFormValues>({
    resolver: zodResolver(electionSchema),
    defaultValues: initialValues(value),
  })

  const eligibleRoleIds = useWatch({
    control: form.control,
    name: 'eligibleRoleIds',
  })

  const toggleRole = (roleId: string) => {
    const current = form.getValues('eligibleRoleIds')
    const next = current.includes(roleId)
      ? current.filter((id) => id !== roleId)
      : [...current, roleId]
    form.setValue('eligibleRoleIds', next, { shouldDirty: true })
  }

  const roleItems = (roles.data ?? []).filter((role) => role.isActive)

  const onSubmit = form.handleSubmit((values) => {
    const base = {
      code: values.code.trim(),
      title: values.title.trim(),
      description: values.description.trim(),
      buildingId: values.buildingId || null,
      periodId: values.periodId || null,
      startAt: toIsoDateTime(values.startAt),
      endAt: toIsoDateTime(values.endAt),
      allowAbstain: values.allowAbstain,
    }

    const onSuccess = async (res: ApiEnvelope<Election>) => {
      notifySuccess(res.status)
      onOpenChange(false)
    }
    const onError = (error: unknown) =>
      notifyError('Gagal menyimpan pemilihan', error)

    if (value) {
      update.mutate({ id: value.id, input: base }, { onSuccess, onError })
      return
    }

    const roleIds = values.eligibleRoleIds
    create.mutate(
      {
        code: base.code,
        title: base.title,
        startAt: base.startAt,
        endAt: base.endAt,
        allowAbstain: base.allowAbstain,
        ...(base.description ? { description: base.description } : {}),
        ...(base.buildingId ? { buildingId: base.buildingId } : {}),
        ...(base.periodId ? { periodId: base.periodId } : {}),
        ...(roleIds.length > 0 ? { eligibleRoleIds: roleIds } : {}),
      },
      { onSuccess, onError },
    )
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Ubah pemilihan' : 'Buat pemilihan'}
          </DialogTitle>
          <DialogDescription>
            Pemilihan ketua beserta jadwal, scope, dan role pemilih.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            noValidate
            onSubmit={onSubmit}
            className="flex max-h-[70vh] flex-col gap-5 overflow-y-auto pr-1"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kode</FormLabel>
                    <FormControl>
                      <Input placeholder="mis. KETUA-2027" {...field} />
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
                    <FormLabel>Judul</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="mis. Pemilihan Ketua 2027"
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
                name="buildingId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Scope</FormLabel>
                    <FormControl>
                      <NativeSelect
                        value={field.value}
                        onChange={field.onChange}
                      >
                        <NativeSelectOption value="">
                          Asrama (semua gedung)
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

              <FormField
                control={form.control}
                name="periodId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Periode</FormLabel>
                    <FormControl>
                      <NativeSelect
                        value={field.value}
                        onChange={field.onChange}
                      >
                        <NativeSelectOption value="">Tanpa periode</NativeSelectOption>
                        {(periods.data ?? []).map((period) => (
                          <NativeSelectOption key={period.id} value={period.id}>
                            {period.name}
                            {period.isActive ? ' (aktif)' : ''}
                          </NativeSelectOption>
                        ))}
                      </NativeSelect>
                    </FormControl>
                    <FormDescription>
                      Diperlukan untuk finalisasi ke jabatan.
                    </FormDescription>
                    <FormMessage className={formErrorClass} />
                  </FormItem>
                )}
              />
            </div>

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
                    <FormMessage className={formErrorClass} />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="allowAbstain"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Opsi abstain</FormLabel>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormDescription>
                    Pemilih boleh memilih tanpa memilih kandidat.
                  </FormDescription>
                </FormItem>
              )}
            />

            {isEdit ? null : (
              <FormItem>
                <FormLabel>Role pemilih (default PENGHUNI)</FormLabel>
                <div className="flex flex-wrap gap-2">
                  {canReadRoles && roleItems.length > 0 ? (
                    roleItems.map((role) => {
                      const active = (eligibleRoleIds ?? []).includes(role.id)
                      return (
                        <button
                          key={role.id}
                          type="button"
                          onClick={() => toggleRole(role.id)}
                          className={cn(
                            buttonVariants({ variant: 'neutral', size: 'sm' }),
                            active && 'bg-foreground text-background',
                          )}
                        >
                          {active ? <Check /> : null}
                          {role.name}
                        </button>
                      )
                    })
                  ) : (
                    <p className="text-xs text-foreground/60">
                      Jika kosong, pemilih default PENGHUNI.
                    </p>
                  )}
                </div>
              </FormItem>
            )}

            <DialogFooter>
              <LoadingButton type="submit" loading={pending} disabled={pending}>
                {isEdit ? 'Simpan perubahan' : 'Buat pemilihan'}
              </LoadingButton>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
