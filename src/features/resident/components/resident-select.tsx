import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { ResidentStatus } from '@/features/resident/api'
import { useResidents } from '@/features/resident/hooks'
import { cn } from '@/lib/utils'

export function ResidentSelect({
  buildingId,
  status,
  value,
  onValueChange,
  disabled,
  placeholder = 'Pilih penghuni',
  className,
  id,
}: {
  buildingId?: string | null
  status?: ResidentStatus
  value?: string | null
  onValueChange: (value: string) => void
  disabled?: boolean
  placeholder?: string
  className?: string
  id?: string
}) {
  const { data, isLoading } = useResidents(buildingId, status)
  const items = (data ?? []).map((resident) => ({
    value: resident.id,
    label: resident.name ?? resident.email,
  }))

  return (
    <Select
      items={items}
      value={value ?? undefined}
      onValueChange={(next) => onValueChange(next as string)}
      disabled={disabled || isLoading || !buildingId}
    >
      <SelectTrigger
        id={id}
        className={cn('bg-secondary-background text-foreground', className)}
      >
        <SelectValue
          placeholder={buildingId ? placeholder : 'Pilih gedung dahulu'}
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
