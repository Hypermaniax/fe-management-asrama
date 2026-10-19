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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import type { Role } from '@/features/rbac/api'
import { useCreateRole, useUpdateRole } from '@/features/rbac/hooks'
import { roleSchema, type RoleFormValues } from '@/features/rbac/schema'
import { type ApiEnvelope } from '@/lib/api'
import { formErrorClass } from '@/lib/form'
import { notifyError, notifySuccess } from '@/lib/notify'

const emptyValues: RoleFormValues = {
  code: '',
  name: '',
  description: '',
  isActive: true,
}

export function RoleFormDialog({
  open,
  onOpenChange,
  role,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  role?: Role | null
}) {
  const isEdit = Boolean(role)
  const create = useCreateRole()
  const update = useUpdateRole()
  const pending = create.isPending || update.isPending

  const form = useForm<RoleFormValues>({
    resolver: zodResolver(roleSchema),
    defaultValues: emptyValues,
  })

  useEffect(() => {
    if (!open) return
    form.reset(
      role
        ? {
            code: role.code,
            name: role.name,
            description: role.description ?? '',
            isActive: role.isActive,
          }
        : emptyValues,
    )
  }, [open, role, form])

  const onSubmit = form.handleSubmit((values) => {
    const onSuccess = (res: ApiEnvelope<Role>) => {
      notifySuccess(res.status, values.name)
      onOpenChange(false)
    }
    const onError = (error: unknown) => notifyError('Gagal menyimpan', error)

    const description = values.description.trim() || null

    if (role) {
      update.mutate(
        {
          id: role.id,
          input: {
            name: values.name,
            description,
            isActive: values.isActive,
          },
        },
        { onSuccess, onError },
      )
      return
    }

    create.mutate(
      { code: values.code, name: values.name, description },
      { onSuccess, onError },
    )
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Ubah role' : 'Tambah role'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Perbarui data role. Kode role tidak dapat diubah.'
              : 'Buat role baru lalu tetapkan permission dan menunya.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form noValidate onSubmit={onSubmit} className="flex flex-col gap-5">
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kode</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="mis. BENDAHARA"
                      disabled={isEdit}
                      {...field}
                    />
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
                    <Input placeholder="mis. Bendahara" {...field} />
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
                    <Input placeholder="Opsional" {...field} />
                  </FormControl>
                  <FormMessage className={formErrorClass} />
                </FormItem>
              )}
            />

            {isEdit ? (
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between gap-3 rounded-base border-2 border-border bg-secondary-background p-3">
                    <div className="flex flex-col gap-0.5">
                      <FormLabel>Aktif</FormLabel>
                      <FormDescription>
                        Role nonaktif tidak menghasilkan akses.
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
            ) : null}

            <DialogFooter>
              <LoadingButton
                type="submit"
                loading={pending}
                disabled={pending}
              >
                {isEdit ? 'Simpan perubahan' : 'Tambah role'}
              </LoadingButton>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
