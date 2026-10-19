import { useMemo, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'

import { LoadingButton } from '@/components/shared/loading-button'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { RoomFacilityItem } from '@/features/facility/api'
import {
  useFacilities,
  useRoomFacilities,
  useSetRoomFacilities,
} from '@/features/facility/hooks'
import type { Room } from '@/features/room/api'
import { notifyError, notifySuccess } from '@/lib/notify'

type Row = { facilityId: string; quantity: number; note: string }
type Option = { value: string; label: string }

function RoomFacilityEditor({
  room,
  facilityItems,
  initialRows,
  saving,
  onSave,
}: {
  room: Room
  facilityItems: Option[]
  initialRows: Row[]
  saving: boolean
  onSave: (items: RoomFacilityItem[]) => void
}) {
  const [rows, setRows] = useState<Row[]>(initialRows)

  const updateRow = (index: number, patch: Partial<Row>) => {
    setRows((prev) =>
      prev.map((row, i) => (i === index ? { ...row, ...patch } : row)),
    )
  }

  const removeRow = (index: number) => {
    setRows((prev) => prev.filter((_, i) => i !== index))
  }

  const addRow = () => {
    setRows((prev) => [...prev, { facilityId: '', quantity: 1, note: '' }])
  }

  const submit = () => {
    onSave(
      rows
        .filter((row) => row.facilityId)
        .map((row) => ({
          facilityId: row.facilityId,
          quantity: row.quantity,
          note: row.note.trim() ? row.note.trim() : undefined,
        })),
    )
  }

  return (
    <>
      <div className="flex flex-col gap-3">
        {rows.length === 0 ? (
          <p className="rounded-base border-2 border-dashed border-border p-6 text-center text-sm text-foreground/70">
            Belum ada fasilitas terpasang di kamar {room.number}.
          </p>
        ) : (
          rows.map((row, index) => (
            <div
              key={index}
              className="grid grid-cols-[1fr_5rem_1fr_auto] items-center gap-2"
            >
              <Select
                items={facilityItems}
                value={row.facilityId || undefined}
                onValueChange={(value) =>
                  updateRow(index, { facilityId: value as string })
                }
              >
                <SelectTrigger className="bg-secondary-background text-foreground">
                  <SelectValue placeholder="Pilih fasilitas" />
                </SelectTrigger>
                <SelectContent>
                  {facilityItems.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="number"
                min={1}
                aria-label="Jumlah"
                value={row.quantity}
                onChange={(event) =>
                  updateRow(index, {
                    quantity: Number(event.target.value) || 1,
                  })
                }
              />
              <Input
                aria-label="Catatan"
                placeholder="Catatan (opsional)"
                value={row.note}
                onChange={(event) =>
                  updateRow(index, { note: event.target.value })
                }
              />
              <Button
                type="button"
                variant="neutral"
                size="icon-sm"
                aria-label="Hapus baris"
                onClick={() => removeRow(index)}
              >
                <Trash2 />
              </Button>
            </div>
          ))
        )}

        <Button
          type="button"
          variant="neutral"
          size="sm"
          className="w-fit"
          onClick={addRow}
          disabled={facilityItems.length === 0}
        >
          <Plus />
          Tambah fasilitas
        </Button>
      </div>

      <DialogFooter>
        <LoadingButton type="button" loading={saving} onClick={submit}>
          Simpan fasilitas
        </LoadingButton>
      </DialogFooter>
    </>
  )
}

export function RoomFacilityDialog({
  open,
  onOpenChange,
  room,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  room?: Room | null
}) {
  const catalog = useFacilities('ROOM', open)
  const current = useRoomFacilities(room?.id, open)
  const save = useSetRoomFacilities()

  const facilityItems = useMemo(
    () =>
      (catalog.data ?? [])
        .filter((facility) => facility.isActive)
        .map((facility) => ({ value: facility.id, label: facility.name })),
    [catalog.data],
  )

  const initialRows = useMemo<Row[]>(
    () =>
      (current.data ?? []).map((item) => ({
        facilityId: item.facilityId,
        quantity: item.quantity,
        note: item.note ?? '',
      })),
    [current.data],
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Fasilitas kamar {room?.number}</DialogTitle>
          <DialogDescription>
            Tetapkan fasilitas yang terpasang di kamar beserta jumlahnya.
          </DialogDescription>
        </DialogHeader>

        {open && room && current.data !== undefined ? (
          <RoomFacilityEditor
            key={room.id}
            room={room}
            facilityItems={facilityItems}
            initialRows={initialRows}
            saving={save.isPending}
            onSave={(items) =>
              save.mutate(
                { roomId: room.id, items },
                {
                  onSuccess: (res) => {
                    notifySuccess(res.status, `Kamar ${room.number}`)
                    onOpenChange(false)
                  },
                  onError: (error) => notifyError('Gagal menyimpan', error),
                },
              )
            }
          />
        ) : (
          <p className="py-8 text-center text-sm text-foreground/70">
            Memuat fasilitas kamar…
          </p>
        )}
      </DialogContent>
    </Dialog>
  )
}
