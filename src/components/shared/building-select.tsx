import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useBuildings } from '@/features/building/hooks'
import { cn } from '@/lib/utils'

export function BuildingSelect({
  value,
  onValueChange,
  disabled,
  placeholder = 'Pilih gedung',
  className,
  id,
}: {
  value?: string | null
  onValueChange: (value: string) => void
  disabled?: boolean
  placeholder?: string
  className?: string
  id?: string
}) {
  const { data, isLoading } = useBuildings()
  const items = (data ?? []).map((building) => ({
    value: building.id,
    label: building.name,
  }))

  return (
    <Select
      items={items}
      value={value ?? undefined}
      onValueChange={(next) => onValueChange(next as string)}
      disabled={disabled || isLoading}
    >
      <SelectTrigger
        id={id}
        className={cn('bg-secondary-background text-foreground', className)}
      >
        <SelectValue placeholder={placeholder} />
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
