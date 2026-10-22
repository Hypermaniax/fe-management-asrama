import { useMemo, useState } from 'react'
import { Check } from 'lucide-react'

import { Can } from '@/components/shared/can'
import { EmptyState } from '@/components/shared/empty-state'
import { LoadingButton } from '@/components/shared/loading-button'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import type { ElectionDetail } from '@/features/election/api'
import { useSetEligibleRoles } from '@/features/election/hooks'
import { useCan } from '@/lib/rbac'
import { useRoles } from '@/features/rbac/hooks'
import { notifyError, notifySuccess } from '@/lib/notify'
import { cn } from '@/lib/utils'

export function EligibleRolesTab({ election }: { election: ElectionDetail }) {
  const roles = useRoles(useCan('role.READ'))
  const setRoles = useSetEligibleRoles()
  const current = useMemo(
    () => election.eligibleRoles.map((item) => item.roleId),
    [election.eligibleRoles],
  )
  const [selected, setSelected] = useState<string[]>(current)

  const roleItems = (roles.data ?? []).filter((role) => role.isActive)
  const roleNames = new Map(
    (roles.data ?? []).map((role) => [role.id, role.name]),
  )

  const dirty = [...selected].sort().join() !== [...current].sort().join()

  const save = () => {
    setRoles.mutate(
      { id: election.id, roleIds: selected },
      {
        onSuccess: (res) => {
          notifySuccess(res.status, `${selected.length} role pemilih`)
        },
        onError: (error) => notifyError('Gagal menyimpan role pemilih', error),
      },
    )
  }

  if (roles.isLoading) {
    return <EmptyState title="Memuat role..." />
  }

  if (roles.error) {
    return (
      <EmptyState
        title="Gagal memuat role"
        description={roles.error.message}
      />
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-sm text-foreground/70">
          Role yang dapat memberi suara:
        </p>
        {election.eligibleRoles.length === 0 ? (
          <Badge variant="neutral">Default PENGHUNI</Badge>
        ) : (
          election.eligibleRoles.map((item) => (
            <Badge key={item.roleId} className="bg-accent-teal text-foreground">
              {item.role?.name ?? roleNames.get(item.roleId) ?? item.roleId}
            </Badge>
          ))
        )}
      </div>

      <Can permission="election.UPDATE">
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap gap-2">
            {roleItems.map((role) => {
              const active = selected.includes(role.id)
              return (
                <button
                  key={role.id}
                  type="button"
                  onClick={() =>
                    setSelected((previous) =>
                      previous.includes(role.id)
                        ? previous.filter((id) => id !== role.id)
                        : [...previous, role.id],
                    )
                  }
                  className={cn(
                    buttonVariants({ variant: 'neutral', size: 'sm' }),
                    active && 'bg-foreground text-background',
                  )}
                >
                  {active ? <Check /> : null}
                  {role.name}
                </button>
              )
            })}
          </div>
          <div>
            <LoadingButton
              type="button"
              loading={setRoles.isPending}
              disabled={setRoles.isPending || !dirty}
              onClick={save}
            >
              Simpan role pemilih
            </LoadingButton>
          </div>
          <p className="text-xs text-foreground/60">
            {selected.length} role dipilih · maksimal satu pemilihan terbuka per
            scope.
          </p>
        </div>
      </Can>
    </div>
  )
}
