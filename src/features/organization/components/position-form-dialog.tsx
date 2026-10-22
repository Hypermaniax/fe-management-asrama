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
import {
  NativeSelect,
  NativeSelectOption,
} from '@/components/ui/native-select'
import { useBuildings } from '@/features/building/hooks'
import type { Position } from '@/features/organization/api'
import {
  useCreatePosition,
  useUpdatePosition,
} from '@/features/organization/hooks'
import {
  positionSchema,
  type PositionFormValues,
} from '@/features/organization/schema'
import { useRoles } from '@/features/rbac/hooks'
import type { ApiEnvelope } from '@/lib/api'
import { formErrorClass } from '@/lib/form'
import { notifyError, notifySuccess } from '@/lib/notify'
import { useCan } from '@/lib/rbac'

function initialValues(position: Position | null): PositionFormValues {
  return position
    ? {
        code: position.code,
        name: position.name,
        level: position.level === null ? '' : String(position.level),
        buildingId: position.buildingId ?? '',
        roleId: position.roleId ?? '',
        description: position.description ?? '',
      }
    : {
        code: '',
        name: '',
        level: '',
        buildingId: '',
        roleId: '',
        description: '',
      }
}

export function PositionFormDialog({
  open,
  onOpenChange,
  position,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  position?: Position | null
}) {
  const value = position ?? null
  const isEdit = Boolean(value)
  const buildings = useBuildings()
  const canReadRoles = useCan('role.READ')
  const roles = useRoles(canReadRoles)
  const create = useCreatePosition()
  const update = useUpdatePosition()
  const pending = create.isPending || update.isPending

  const form = useForm<PositionFormValues>({
    resolver: zodResolver(positionSchema),
    defaultValues: initialValues(value),
  })

  const onSubmit = form.handleSubmit((values) => {
    const input: {
      code: string
      name: string
      level?: number
      description?: string
      buildingId?: string
      roleId?: string
    } = {
      code: values.code.trim(),
      name: values.name.trim(),
    }
    if (values.level.trim()) input.level = Number(values.level)
    if (values.buildingId) input.buildingId = values.buildingId
    if (values.roleId) input.roleId = values.roleId
    if (values.description.trim() || isEdit) {
      input.description = values.description.trim()
    }

    const onSuccess = (res: ApiEnvelope<Position>) => {
      notifySuccess(res.status, values.name)
      onOpenChange(false)
    }
    const onError = (error: unknown) => notifyError('Gagal menyimpan', error)

    if (value) {
      update.mutate({ id: value.id, input }, { onSuccess, onError })
      return
    }

    create.mutate(input, { onSuccess, onError })
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Ubah jabatan' : 'Tambah jabatan'}
          </DialogTitle>
          <DialogDescription>
            Jabatan dapat berlaku untuk asrama atau khusus satu gedung.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form noValidate onSubmit={onSubmit} className="flex flex-col gap-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kode</FormLabel>
                    <FormControl>
                      <Input placeholder="mis. KETUA" {...field} />
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
                      <Input placeholder="mis. Ketua" {...field} />
                    </FormControl>
                    <FormMessage className={formErrorClass} />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Level</FormLabel>
                    <FormControl>
                      <Input
                        inputMode="numeric"
                        placeholder="mis. 1"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className={formErrorClass} />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="buildingId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Scope</FormLabel>
                    <FormControl>
                      <NativeSelect
                        value={field.value}
                        onChange={(event) => field.onChange(event.target.value)}
                        disabled={isEdit}
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
                    <FormDescription>
                      Scope tidak dapat diubah setelah jabatan dibuat.
                    </FormDescription>
                    <FormMessage className={formErrorClass} />
                  </FormItem>
                )}
              />
            </div>

            {canReadRoles ? (
              <FormField
                control={form.control}
                name="roleId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role terkait</FormLabel>
                    <FormControl>
                      <NativeSelect
                        value={field.value}
                        onChange={(event) => field.onChange(event.target.value)}
                      >
                        <NativeSelectOption value="">
                          Tanpa role
                        </NativeSelectOption>
                        {(roles.data ?? []).map((role) => (
                          <NativeSelectOption key={role.id} value={role.id}>
                            {role.name}
                          </NativeSelectOption>
                        ))}
                      </NativeSelect>
                    </FormControl>
                    <FormDescription>
                      Role hanya referensi; akses tetap diatur lewat penugasan
                      role pengguna. Role yang sudah dipilih tidak dapat
                      dikosongkan.
                    </FormDescription>
                    <FormMessage className={formErrorClass} />
                  </FormItem>
                )}
              />
            ) : null}

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Deskripsi</FormLabel>
                  <FormControl>
                    <Input placeholder="Opsional" {...field} />
                  </FormControl>
                  <FormMessage className={formErrorClass} />
                </FormItem>
              )}
            />

            <DialogFooter>
              <LoadingButton
                type="submit"
                loading={pending}
                disabled={pending}
              >
                {isEdit ? 'Simpan perubahan' : 'Tambah jabatan'}
              </LoadingButton>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
