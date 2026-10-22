import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  addCandidate,
  cancelElection,
  castVote,
  closeElection,
  createElection,
  deleteCandidate,
  deleteElection,
  fetchElection,
  fetchElectionResult,
  fetchElections,
  finalizeElection,
  openElection,
  setEligibleRoles,
  updateElection,
  type CandidateInput,
  type ElectionInput,
  type ElectionQuery,
  type ElectionStatus,
  type ElectionUpdate,
  type FinalizeInput,
} from '@/features/election/api'

export function useElections(params: ElectionQuery = {}) {
  return useQuery({
    queryKey: ['elections', 'list', params],
    queryFn: () => fetchElections(params),
  })
}

export function useElection(id: string | undefined) {
  return useQuery({
    queryKey: ['elections', 'detail', id ?? null],
    queryFn: () => fetchElection(id as string),
    enabled: Boolean(id),
  })
}

export function useElectionResult(electionId: string) {
  return useQuery({
    queryKey: ['elections', 'result', electionId],
    queryFn: () => fetchElectionResult(electionId),
    enabled: Boolean(electionId),
  })
}

function useInvalidateElections() {
  const queryClient = useQueryClient()
  return () => {
    queryClient.invalidateQueries({ queryKey: ['elections'] })
  }
}

export function useCreateElection() {
  const invalidate = useInvalidateElections()
  return useMutation({
    mutationFn: (input: ElectionInput) => createElection(input),
    onSuccess: invalidate,
  })
}

export function useUpdateElection() {
  const invalidate = useInvalidateElections()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: ElectionUpdate }) =>
      updateElection(id, input),
    onSuccess: invalidate,
  })
}

export function useDeleteElection() {
  const invalidate = useInvalidateElections()
  return useMutation({
    mutationFn: (id: string) => deleteElection(id),
    onSuccess: invalidate,
  })
}

export function useSetEligibleRoles() {
  const invalidate = useInvalidateElections()
  return useMutation({
    mutationFn: ({ id, roleIds }: { id: string; roleIds: string[] }) =>
      setEligibleRoles(id, roleIds),
    onSuccess: invalidate,
  })
}

export function useElectionTransition() {
  const invalidate = useInvalidateElections()
  return useMutation({
    mutationFn: ({
      id,
      action,
    }: {
      id: string
      action: 'open' | 'close' | 'cancel'
    }) =>
      action === 'open'
        ? openElection(id)
        : action === 'close'
          ? closeElection(id)
          : cancelElection(id),
    onSuccess: invalidate,
  })
}

export function useAddCandidate() {
  const invalidate = useInvalidateElections()
  return useMutation({
    mutationFn: ({
      electionId,
      input,
    }: {
      electionId: string
      input: CandidateInput
    }) => addCandidate(electionId, input),
    onSuccess: invalidate,
  })
}

export function useDeleteCandidate() {
  const invalidate = useInvalidateElections()
  return useMutation({
    mutationFn: ({
      electionId,
      candidateId,
    }: {
      electionId: string
      candidateId: string
    }) => deleteCandidate(electionId, candidateId),
    onSuccess: invalidate,
  })
}

export function useCastVote() {
  const invalidate = useInvalidateElections()
  return useMutation({
    mutationFn: ({
      electionId,
      input,
    }: {
      electionId: string
      input: { candidateId: string | null }
    }) => castVote(electionId, input),
    onSuccess: invalidate,
  })
}

export function useFinalizeElection() {
  const invalidate = useInvalidateElections()
  return useMutation({
    mutationFn: ({
      electionId,
      input,
    }: {
      electionId: string
      input: FinalizeInput
    }) => finalizeElection(electionId, input),
    onSuccess: invalidate,
  })
}

export function useElectionStatusFilter() {
  return (status: string) => (status === 'ALL' ? undefined : status) as
    | ElectionStatus
    | undefined
}
