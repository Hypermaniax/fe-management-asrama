import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import {
  ArrowLeft,
  Pencil,
  Play,
  Square,
  SquareX,
  Trash2,
} from 'lucide-react'

import { Can } from '@/components/shared/can'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { DataTable, type Column } from '@/components/shared/data-table'
import { DateText } from '@/components/shared/date-text'
import { EmptyState } from '@/components/shared/empty-state'
import { ErrorState } from '@/components/shared/error-state'
import { PageHeader } from '@/components/shared/page-header'
import { StatusBadge } from '@/components/shared/status-badge'
import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useBuildings } from '@/features/building/hooks'
import type { Election, ElectionCandidate } from '@/features/election/api'
import { CandidateFormDialog } from '@/features/election/components/candidate-form-dialog'
import { EligibleRolesTab } from '@/features/election/components/eligible-roles-tab'
import { FinalizeTab } from '@/features/election/components/finalize-tab'
import { ElectionFormDialog } from '@/features/election/components/election-form-dialog'
import { ResultsPanel } from '@/features/election/components/result-bars'
import {
  useDeleteElection,
  useDeleteCandidate,
  useElection,
  useElectionTransition,
} from '@/features/election/hooks'
import { ELECTION_STATUS_LABELS } from '@/features/election/lib'
import { notifySuccess, notifyError } from '@/lib/notify'

export default function ElectionDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const buildings = useBuildings()
  const query = useElection(id)
  const remove = useDeleteElection()
  const removeCandidate = useDeleteCandidate()
  const transition = useElectionTransition()

  const [editOpen, setEditOpen] = useState(false)
  const [addCandidateOpen, setAddCandidateOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [candidateTarget, setCandidateTarget] =
    useState<ElectionCandidate | null>(null)
  const [transitionTarget, setTransitionTarget] = useState<
    'open' | 'close' | 'cancel' | null
  >(null)

  const election = query.data
  const buildingName = election?.buildingId
    ? ((buildings.data ?? []).find(
        (building) => building.id === election?.buildingId,
      )?.name ?? 'Gedung')
    : 'Asrama'

  const runTransition = () => {
    if (!transitionTarget || !election) return
    const action = transitionTarget
    transition.mutate(
      { id: election.id, action },
      {
        onSuccess: (res) => {
          notifySuccess(res.status, election.title)
          setTransitionTarget(null)
        },
        onError: (error) =>
          notifyError(
            action === 'open'
              ? 'Gagal membuka pemilihan'
              : action === 'close'
                ? 'Gagal menutup pemilihan'
                : 'Gagal membatalkan pemilihan',
            error,
          ),
      },
    )
  }

  const confirmDelete = () => {
    if (!election) return
    remove.mutate(election.id, {
      onSuccess: (res) => {
        notifySuccess(res.status, election.title)
        navigate('/app/elections')
      },
      onError: (error) => notifyError('Gagal menghapus pemilihan', error),
    })
  }

  const confirmRemoveCandidate = () => {
    if (!candidateTarget || !election) return
    removeCandidate.mutate(
      { electionId: election.id, candidateId: candidateTarget.id },
      {
        onSuccess: (res) => {
          notifySuccess(res.status)
          setCandidateTarget(null)
        },
        onError: (error) => notifyError('Gagal menghapus kandidat', error),
      },
    )
  }

  if (query.isLoading) {
    return <EmptyState title="Memuat pemilihan..." />
  }

  if (query.error || !election) {
    return (
      <div className="flex flex-col gap-4">
        <ErrorState
          message={
            query.error ? query.error.message : 'Pemilihan tidak ditemukan.'
          }
          onRetry={() => query.refetch()}
        />
        <div>
          <Link
            to="/app/elections"
            className={buttonVariants({ variant: 'neutral' })}
          >
            <ArrowLeft />
            Kembali ke daftar
          </Link>
        </div>
      </div>
    )
  }

  const status = election.status
  const resultVisible =
    status === 'CLOSED' || status === 'DONE' ? true : status === 'CANCELLED'

  const candidateColumns: Column<ElectionCandidate>[] = [
    {
      key: 'orderNo',
      header: 'No',
      cell: (row) => row.orderNo ?? '—',
    },
    {
      key: 'user',
      header: 'Warga',
      cell: (row) => (
        <div className="flex flex-col gap-0.5">
          <Link
            to={`/app/residents/${row.userId}`}
            className="font-heading underline-offset-2 hover:underline"
          >
            {row.user?.name ?? row.user?.email ?? row.userId}
          </Link>
          <span className="text-xs text-foreground/60">
            {row.user?.email ?? '—'}
          </span>
        </div>
      ),
    },
    {
      key: 'vision',
      header: 'Visi',
      className: 'max-w-xs text-foreground/80',
      cell: (row) => row.vision ?? '—',
    },
    {
      key: 'mission',
      header: 'Misi',
      className: 'max-w-xs truncate text-foreground/80',
      cell: (row) => row.mission ?? '—',
    },
    {
      key: 'actions',
      header: '',
      headClassName: 'text-right',
      className: 'text-right',
      cell: (row) => (
        <Can permission="election.UPDATE">
          <Button
            type="button"
            variant="neutral"
            size="icon-sm"
            aria-label="Hapus kandidat"
            onClick={() => setCandidateTarget(row)}
          >
            <Trash2 />
          </Button>
        </Can>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <Link
        to="/app/elections"
        className="inline-flex w-fit items-center gap-1 text-sm text-foreground/70 hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Daftar pemilihan
      </Link>

      <PageHeader
        title={
          <span className="flex flex-wrap items-center gap-2">
            {election.title}
            <StatusBadge
              status={election.status}
              label={ELECTION_STATUS_LABELS[election.status]}
            />
          </span>
        }
        description={
          election.description
            ? `${election.code} · ${election.description}`
            : election.code
        }
      >
        {status === 'DRAFT' || status === 'SCHEDULED' ? (
          <Can permission="election.UPDATE">
            <Button type="button" onClick={() => setTransitionTarget('open')}>
              <Play />
              Buka pemilihan
            </Button>
          </Can>
        ) : null}
        {status === 'OPEN' ? (
          <>
            <Can permission="election.UPDATE">
              <Button
                type="button"
                variant="neutral"
                onClick={() => setTransitionTarget('close')}
              >
                <Square />
                Tutup
              </Button>
              <Button
                type="button"
                variant="neutral"
                onClick={() => setTransitionTarget('cancel')}
              >
                <SquareX />
                Batalkan
              </Button>
            </Can>
          </>
        ) : null}
        <Can permission="election.UPDATE">
          <Button
            type="button"
            variant="neutral"
            onClick={() => setEditOpen(true)}
          >
            <Pencil />
            Ubah
          </Button>
        </Can>
        <Can permission="election.DELETE">
          <Button
            type="button"
            variant="neutral"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 />
            Hapus
          </Button>
        </Can>
      </PageHeader>

      <div className="grid gap-3 rounded-base border-2 border-border bg-secondary-background p-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="flex flex-col gap-0.5">
          <span className="text-xs text-foreground/60">Periode</span>
          <span className="font-heading">
            {election.period?.name ?? '—'}
          </span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-xs text-foreground/60">Scope</span>
          <span>{buildingName}</span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-xs text-foreground/60">Mulai</span>
          <DateText value={election.startAt} withTime />
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-xs text-foreground/60">Selesai</span>
          <DateText value={election.endAt} withTime />
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-xs text-foreground/60">Abstain</span>
          {election.allowAbstain ? (
            <Badge className="bg-accent-teal text-foreground">Diizinkan</Badge>
          ) : (
            <Badge variant="neutral">Tidak diizinkan</Badge>
          )}
        </div>
      </div>

      <Tabs defaultValue="candidates">
        <TabsList className="h-auto flex-wrap justify-start">
          <TabsTrigger value="candidates">
            Kandidat ({election.candidates.length})
          </TabsTrigger>
          <TabsTrigger value="eligible">Role Pemilih</TabsTrigger>
          <TabsTrigger value="results">Hasil</TabsTrigger>
          <TabsTrigger value="finalize">Finalisasi</TabsTrigger>
        </TabsList>

        <TabsContent value="candidates" className="pt-4">
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-foreground/70">
                {election.candidates.length} kandidat terdaftar
              </p>
              <Can permission="election.UPDATE">
                <Button type="button" onClick={() => setAddCandidateOpen(true)}>
                  Tambah kandidat
                </Button>
              </Can>
            </div>
            <DataTable
              columns={candidateColumns}
              data={election.candidates}
              getRowId={(row) => row.id}
              pageSize={10}
              emptyTitle="Belum ada kandidat"
              emptyDescription="Kandidat harus warga aktif pada scope pemilihan."
              emptyAction={
                <Can permission="election.UPDATE">
                  <Button
                    type="button"
                    onClick={() => setAddCandidateOpen(true)}
                  >
                    Tambah kandidat
                  </Button>
                </Can>
              }
            />
          </div>
        </TabsContent>

        <TabsContent value="eligible" className="pt-4">
          <EligibleRolesTab
            key={election.eligibleRoles.map((item) => item.roleId).join()}
            election={election}
          />
        </TabsContent>

        <TabsContent value="results" className="pt-4">
          {status === 'OPEN' ? (
            <EmptyState
              title="Hasil terkunci"
              description="Hasil hanya tampil setelah pemilihan ditutup."
            />
          ) : resultVisible && status !== 'CANCELLED' ? (
            <ResultsPanel electionId={election.id} />
          ) : (
            <EmptyState
              title="Belum ada hasil"
              description={
                status === 'CANCELLED'
                  ? 'Pemilihan dibatalkan sehingga tidak ada hasil.'
                  : 'Hasil tersedia setelah pemilihan ditutup.'
              }
            />
          )}
        </TabsContent>

        <TabsContent value="finalize" className="pt-4">
          <FinalizeTab election={election} />
        </TabsContent>
      </Tabs>

      {editOpen ? (
        <ElectionFormDialog
          key={election.id}
          open
          onOpenChange={setEditOpen}
          election={election as Election}
        />
      ) : null}

      {addCandidateOpen ? (
        <CandidateFormDialog
          open
          onOpenChange={setAddCandidateOpen}
          election={election}
        />
      ) : null}

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Hapus pemilihan?"
        description={`Pemilihan ${election.title} beserta kandidat dan suara akan dihapus.`}
        confirmLabel="Hapus"
        loading={remove.isPending}
        onConfirm={confirmDelete}
      />

      <ConfirmDialog
        open={Boolean(candidateTarget)}
        onOpenChange={(open) => {
          if (!open) setCandidateTarget(null)
        }}
        title="Hapus kandidat?"
        description={
          candidateTarget
            ? `${candidateTarget.user?.name ?? candidateTarget.user?.email ?? 'Kandidat'} akan dilepas dari pemilihan.`
            : undefined
        }
        confirmLabel="Hapus"
        loading={removeCandidate.isPending}
        onConfirm={confirmRemoveCandidate}
      />

      <ConfirmDialog
        open={Boolean(transitionTarget)}
        onOpenChange={(open) => {
          if (!open) setTransitionTarget(null)
        }}
        title={
          transitionTarget === 'open'
            ? 'Buka pemilihan?'
            : transitionTarget === 'close'
              ? 'Tutup pemilihan?'
              : 'Batalkan pemilihan?'
        }
        description={
          transitionTarget === 'open'
            ? 'Pemilih sesuai role akan dapat memberi suara. Maksimal satu pemilihan terbuka per scope.'
            : transitionTarget === 'close'
              ? 'Hasil akan dihitung dan dikunci setelah ditutup.'
              : 'Pemilihan dibatalkan dan tidak bisa dibuka kembali.'
        }
        confirmLabel={
          transitionTarget === 'open'
            ? 'Buka'
            : transitionTarget === 'close'
              ? 'Tutup'
              : 'Batalkan'
        }
        tone={transitionTarget === 'cancel' ? 'danger' : 'default'}
        loading={transition.isPending}
        onConfirm={runTransition}
      />
    </div>
  )
}
