import { useMemo, useState } from 'react'
import { Plus, X } from 'lucide-react'

import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { EmptyState } from '@/components/shared/empty-state'
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
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { PublicFacility } from '@/features/public-facility/api'
import {
  useAssignments,
  useAssignSlot,
  useReleaseAssignment,
} from '@/features/public-facility/hooks'
import { useResidents } from '@/features/resident/hooks'
import { notifyError, notifySuccess } from '@/lib/notify'

export function PublicFacilitySlotDialog({
  open,
  onOpenChange,
  publicFacility,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  publicFacility?: PublicFacility | null
}) {
  const assignments = useAssignments(publicFacility?.id, open)
  const residents = useResidents(
    open ? publicFacility?.buildingId : null,
    'ACTIVE',
  )
  const assign = useAssignSlot()
  const release = useReleaseAssignment()

  const [userId, setUserId] = useState('')
  const [slotLabel, setSlotLabel] = useState('')
  const [target, setTarget] = useState<string | null>(null)

  const residentItems = useMemo(
    () =>
      (residents.data ?? []).map((resident) => ({
        value: resident.id,
        label: resident.name ?? resident.email,
      })),
    [residents.data],
  )

  const submit = () => {
    if (!publicFacility) return
    if (!userId || !slotLabel.trim()) {
      notifyError('Data belum lengkap', 'Pilih penghuni dan isi label slot.')
      return
    }
    assign.mutate(
      { id: publicFacility.id, input: { userId, slotLabel: slotLabel.trim() } },
      {
        onSuccess: (res) => {
          notifySuccess(res.status)
          setUserId('')
          setSlotLabel('')
        },
        onError: (error) => notifyError('Gagal menugaskan slot', error),
      },
    )
  }

  const confirmRelease = () => {
    if (!target) return
    release.mutate(target, {
      onSuccess: (res) => {
        notifySuccess(res?.status ?? 'Slot dilepas')
        setTarget(null)
      },
      onError: (error) => notifyError('Gagal melepas slot', error),
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            Slot {publicFacility?.facility.name}
            {publicFacility?.number ? ` ${publicFacility.number}` : ''}
          </DialogTitle>
          <DialogDescription>
            Tugaskan slot kepada penghuni atau lepaskan penugasan yang ada.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 rounded-base border-2 border-border bg-secondary-background p-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label>Penghuni</Label>
                <Select
                  items={residentItems}
                  value={userId || undefined}
                  onValueChange={(value) => setUserId(value as string)}
                  disabled={residents.isLoading}
                >
                  <SelectTrigger className="bg-background text-foreground">
                    <SelectValue placeholder="Pilih penghuni" />
                  </SelectTrigger>
                  <SelectContent>
                    {residentItems.map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="slot-label">Label slot</Label>
                <Input
                  id="slot-label"
                  placeholder="mis. A"
                  value={slotLabel}
                  onChange={(event) => setSlotLabel(event.target.value)}
                />
              </div>
            </div>
            <LoadingButton
              type="button"
              size="sm"
              className="w-fit"
              loading={assign.isPending}
              disabled={assign.isPending}
              onClick={submit}
            >
              <Plus />
              Tugaskan
            </LoadingButton>
          </div>

          {assignments.isLoading ? null : (assignments.data ?? []).length === 0 ? (
            <EmptyState
              title="Belum ada penugasan"
              description="Slot ini belum ditugaskan ke penghuni mana pun."
            />
          ) : (
            <ul className="flex flex-col divide-y-2 divide-border border-y-2 border-border">
              {(assignments.data ?? []).map((assignment) => (
                <li
                  key={assignment.id}
                  className="flex items-center gap-4 py-3"
                >
                  <span className="grid size-9 shrink-0 place-items-center rounded-base border-2 border-border bg-accent-teal font-heading text-foreground">
                    {assignment.slotLabel}
                  </span>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate font-heading">
                      {assignment.user.name ?? assignment.user.email}
                    </span>
                    <span className="truncate text-xs text-foreground/70">
                      {assignment.user.email}
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="neutral"
                    size="icon-sm"
                    aria-label="Lepaskan slot"
                    onClick={() => setTarget(assignment.id)}
                  >
                    <X />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="neutral"
            onClick={() => onOpenChange(false)}
          >
            Tutup
          </Button>
        </DialogFooter>
      </DialogContent>

      <ConfirmDialog
        open={Boolean(target)}
        onOpenChange={(next) => {
          if (!next) setTarget(null)
        }}
        title="Lepaskan slot?"
        description="Penugasan slot ini akan dihapus."
        confirmLabel="Lepaskan"
        loading={release.isPending}
        onConfirm={confirmRelease}
      />
    </Dialog>
  )
}
