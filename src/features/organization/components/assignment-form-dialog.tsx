import { useEffect, useMemo } from 'react'
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
import { useBuildings } from '@/features/building/hooks'
import { useCreateAssignment } from '@/features/organization/hooks'
import { todayDate, toIsoDate } from '@/features/organization/lib'
import {
  assignmentSchema,
  type AssignmentFormValues,
} from '@/features/organization/schema'
import { usePeriods, usePositions } from '@/features/organization/hooks'
import { useResidentNames, useResidents } from '@/features/resident/hooks'
import type { ApiEnvelope } from '@/lib/api'
import type { Assignment } from '@/features/organization/api'
import { formErrorClass } from '@/lib/form'
import { notifyError, notifySuccess } from '@/lib/notify'

export function AssignmentFormDialog({
  open,
  onOpenChange,
  defaultUserId,
  defaultBuildingId,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultUserId?: string
  defaultBuildingId?: string
}) {
  const buildings = useBuildings()
  const periods = usePeriods()
  const positions = usePositions()
  const create = useCreateAssignment()

  const buildingIds = (buildings.data ?? []).map((building) => building.id)
  const allNames = useResidentNames(buildingIds)

  const activePeriod =
    (periods.data ?? []).find((period) => period.isActive) ??
    (periods.data ?? [])[0]

  const form = useForm<AssignmentFormValues>({
    resolver: zodResolver(assignmentSchema),
    defaultValues: {
      userId: defaultUserId ?? '',
      periodId: activePeriod?.id ?? '',
      positionId: '',
      buildingId: defaultBuildingId ?? '',
      startDate: todayDate(),
      decreeNumber: '',
    },
  })

  const selectedBuilding = useWatch({
    control: form.control,
    name: 'buildingId',
  })
  const residents = useResidents(selectedBuilding || null)

  useEffect(() => {
    if (!open || !activePeriod) return
    if (!form.getValues('periodId')) {
      form.setValue('periodId', activePeriod.id, { shouldValidate: true })
    }
  }, [open, activePeriod, form])

  const userOptions = useMemo(() => {
    if (selectedBuilding) {
      return (residents.data ?? []).map((resident) => ({
        id: resident.id,
        name: resident.name ?? resident.email,
      }))
    }
    return [...allNames.entries()]
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [selectedBuilding, residents.data, allNames])

  const positionOptions = useMemo(() => {
    return (positions.data ?? []).filter((position) => {
      if (!position.isActive) return false
      return (
        !selectedBuilding ||
        !position.buildingId ||
        position.buildingId === selectedBuilding
      )
    })
  }, [positions.data, selectedBuilding])

  const onSubmit = form.handleSubmit((values) => {
    const onSuccess = (res: ApiEnvelope<Assignment>) => {
      notifySuccess(res.status, 'Penugasan berhasil dibuat')
      onOpenChange(false)
    }
    const onError = (error: unknown) => notifyError('Gagal menugaskan', error)

    create.mutate(
      {
        userId: values.userId,
        periodId: values.periodId,
        positionId: values.positionId,
        startDate: toIsoDate(values.startDate),
        ...(values.decreeNumber.trim()
          ? { decreeNumber: values.decreeNumber.trim() }
          : {}),
        ...(values.buildingId ? { buildingId: values.buildingId } : {}),
      },
      { onSuccess, onError },
    )
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Tugaskan pengurus</DialogTitle>
          <DialogDescription>
            Penugasan hanya menyusun struktur; akses tetap berasal dari role
            pengguna.
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
                    <NativeSelect
                      value={field.value}
                      onChange={(event) => {
                        field.onChange(event.target.value)
                        form.setValue('userId', '')
                        form.setValue('positionId', '')
                      }}
                    >
                      <NativeSelectOption value="">Asrama</NativeSelectOption>
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
              name="userId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pengguna</FormLabel>
                  <FormControl>
                    <NativeSelect
                      value={field.value}
                      onChange={(event) => field.onChange(event.target.value)}
                    >
                      <NativeSelectOption value="">
                        Pilih pengguna
                      </NativeSelectOption>
                      {userOptions.map((user) => (
                        <NativeSelectOption key={user.id} value={user.id}>
                          {user.name}
                        </NativeSelectOption>
                      ))}
                    </NativeSelect>
                  </FormControl>
                  <FormMessage className={formErrorClass} />
                </FormItem>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="periodId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Periode</FormLabel>
                    <FormControl>
                      <NativeSelect
                        value={field.value}
                        onChange={(event) => field.onChange(event.target.value)}
                      >
                        <NativeSelectOption value="">
                          Pilih periode
                        </NativeSelectOption>
                        {(periods.data ?? []).map((period) => (
                          <NativeSelectOption
                            key={period.id}
                            value={period.id}
                          >
                            {period.name}
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
                name="positionId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Jabatan</FormLabel>
                    <FormControl>
                      <NativeSelect
                        value={field.value}
                        onChange={(event) => field.onChange(event.target.value)}
                      >
                        <NativeSelectOption value="">
                          Pilih jabatan
                        </NativeSelectOption>
                        {positionOptions.map((position) => (
                          <NativeSelectOption
                            key={position.id}
                            value={position.id}
                          >
                            {position.name}
                          </NativeSelectOption>
                        ))}
                      </NativeSelect>
                    </FormControl>
                    <FormMessage className={formErrorClass} />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mulai</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage className={formErrorClass} />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="decreeNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nomor SK</FormLabel>
                    <FormControl>
                      <Input placeholder="Opsional" {...field} />
                    </FormControl>
                    <FormMessage className={formErrorClass} />
                  </FormItem>
                )}
              />
            </div>

            <FormDescription>
              Satu pengguna dapat memiliki beberapa penugasan pada periode yang
              sama.
            </FormDescription>

            <DialogFooter>
              <LoadingButton
                type="submit"
                loading={create.isPending}
                disabled={create.isPending}
              >
                Simpan penugasan
              </LoadingButton>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
