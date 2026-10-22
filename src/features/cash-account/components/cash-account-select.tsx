import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useCashAccounts } from '@/features/cash-account/hooks'
import { cn } from '@/lib/utils'

export function CashAccountSelect({
  buildingId,
  value,
  onValueChange,
  disabled,
  placeholder = 'Pilih akun kas',
  className,
  id,
}: {
  buildingId?: string | null
  value?: string | null
  onValueChange: (value: string) => void
  disabled?: boolean
  placeholder?: string
  className?: string
  id?: string
}) {
  const { data, isLoading } = useCashAccounts()
  const items = (data ?? [])
    .filter((account) => account.buildingId === buildingId)
    .map((account) => ({
      value: account.id,
      label: `${account.name} (${account.type === 'BANK' ? 'Bank' : 'Tunai'})`,
    }))

  return (
    <Select
      items={items}
      value={value ?? undefined}
      onValueChange={(next) => onValueChange(next as string)}
      disabled={disabled || isLoading || !buildingId || items.length === 0}
    >
      <SelectTrigger
        id={id}
        className={cn('bg-secondary-background text-foreground', className)}
      >
        <SelectValue
          placeholder={
            !buildingId
              ? 'Pilih gedung dahulu'
              : items.length === 0
                ? 'Belum ada akun kas'
                : placeholder
          }
        />
      </SelectTrigger>
      <SelectContent>
        {items.map((item) => (
          <SelectItem key={item.value} value={item.value}>
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
