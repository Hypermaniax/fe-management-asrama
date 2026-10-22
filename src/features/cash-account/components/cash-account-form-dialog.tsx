import { useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { CashAccount, CashAccountType } from '@/features/cash-account/api'
import {
  useCreateCashAccount,
  useUpdateCashAccount,
} from '@/features/cash-account/hooks'
import {
  cashAccountSchema,
  type CashAccountFormValues,
} from '@/features/cash-account/schema'
import type { ApiEnvelope } from '@/lib/api'
import { formErrorClass } from '@/lib/form'
import { notifyError, notifySuccess } from '@/lib/notify'

const TYPE_ITEMS = [
  { value: 'CASH', label: 'Tunai' },
  { value: 'BANK', label: 'Bank' },
]

const emptyValues: CashAccountFormValues = {
  buildingId: '',
  name: '',
  type: 'CASH',
  openingBalance: '0',
}

export function CashAccountFormDialog({
  open,
  onOpenChange,
  cashAccount,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  cashAccount?: CashAccount | null
}) {
  const isEdit = Boolean(cashAccount)
  const create = useCreateCashAccount()
  const update = useUpdateCashAccount()
  const pending = create.isPending || update.isPending

  const form = useForm<CashAccountFormValues>({
    resolver: zodResolver(cashAccountSchema),
    defaultValues: emptyValues,
  })

  useEffect(() => {
    if (!open) return
    form.reset(
      cashAccount
        ? {
            buildingId: cashAccount.buildingId,
            name: cashAccount.name,
            type: cashAccount.type,
            openingBalance: String(cashAccount.openingBalance),
          }
        : emptyValues,
    )
  }, [open, cashAccount, form])

  const onSubmit = form.handleSubmit((values) => {
    const onSuccess = (res: ApiEnvelope<CashAccount>) => {
      notifySuccess(res.status, values.name)
      onOpenChange(false)
    }
    const onError = (error: unknown) => notifyError('Gagal menyimpan', error)

    const input = {
      name: values.name,
      type: values.type as CashAccountType,
      openingBalance: Number(values.openingBalance),
    }

    if (cashAccount) {
      update.mutate({ id: cashAccount.id, input }, { onSuccess, onError })
      return
    }

    create.mutate(
      { buildingId: values.buildingId, ...input },
      { onSuccess, onError },
    )
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Ubah akun kas' : 'Tambah akun kas'}
          </DialogTitle>
          <DialogDescription>
            Satu gedung hanya memiliki satu akun kas.
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
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={isEdit}
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
                  <FormLabel>Nama akun</FormLabel>
                  <FormControl>
                    <Input placeholder="mis. Kas Tunai G1" {...field} />
                  </FormControl>
                  <FormMessage className={formErrorClass} />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipe</FormLabel>
                  <Select
                    items={TYPE_ITEMS}
                    value={field.value}
                    onValueChange={(value) => field.onChange(value)}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-secondary-background text-foreground">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {TYPE_ITEMS.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage className={formErrorClass} />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="openingBalance"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Saldo awal</FormLabel>
                  <FormControl>
                    <Input
                      inputMode="numeric"
                      placeholder="0"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Saldo awal saat akun dibuat, dalam rupiah.
                  </FormDescription>
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
                {isEdit ? 'Simpan perubahan' : 'Tambah akun'}
              </LoadingButton>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
