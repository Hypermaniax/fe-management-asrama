import { Building2 } from 'lucide-react'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useBuildings } from '@/features/building/hooks'
import { useScopeStore } from '@/stores/scope'

export function BuildingPicker() {
  const buildings = useScopeStore((state) => state.buildings)
  const active = useScopeStore((state) => state.activeBuildingId)
  const setActive = useScopeStore((state) => state.setActiveBuilding)

  const { data } = useBuildings(buildings.length > 1)

  if (buildings.length <= 1) {
    return null
  }

  const items = buildings.map((id) => ({
    value: id,
    label: data?.find((building) => building.id === id)?.name ?? id,
  }))

  return (
    <Select
      items={items}
      value={active ?? undefined}
      onValueChange={(value) => setActive(value as string)}
    >
      <SelectTrigger
        aria-label="Pilih gedung aktif"
        className="h-9 w-44 bg-background text-foreground"
      >
        <Building2 className="size-4" />
        <SelectValue />
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
