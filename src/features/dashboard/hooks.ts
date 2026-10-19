import { useQuery } from '@tanstack/react-query'

import {
  fetchArrears,
  fetchCashBalances,
  fetchElections,
  fetchEvents,
  fetchIncomeVsExpense,
  fetchMyAttendance,
  fetchMyInvoices,
  fetchMyPayments,
} from '@/features/dashboard/api'

export function useArrears(
  params: { buildingId?: string; year: number; month: number },
  enabled = true,
) {
  return useQuery({
    queryKey: ['dashboard', 'arrears', params],
    queryFn: () => fetchArrears(params),
    enabled,
  })
}

export function useCashBalances(buildingId?: string, enabled = true) {
  return useQuery({
    queryKey: ['dashboard', 'cash-balances', buildingId ?? null],
    queryFn: () => fetchCashBalances(buildingId),
    enabled,
  })
}

export function useIncomeVsExpense(
  params: { buildingId?: string; from: string; to: string },
  enabled = true,
) {
  return useQuery({
    queryKey: ['dashboard', 'income-vs-expense', params],
    queryFn: () => fetchIncomeVsExpense(params),
    enabled,
  })
}

export function useDashboardEvents(enabled = true) {
  return useQuery({
    queryKey: ['dashboard', 'events'],
    queryFn: fetchEvents,
    enabled,
  })
}

export function useOpenElections(enabled = true) {
  return useQuery({
    queryKey: ['dashboard', 'elections', 'OPEN'],
    queryFn: () => fetchElections('OPEN'),
    enabled,
  })
}

export function useMyAttendance(enabled = true) {
  return useQuery({
    queryKey: ['dashboard', 'me-attendance'],
    queryFn: fetchMyAttendance,
    enabled,
  })
}

export function useMyInvoices(enabled = true) {
  return useQuery({
    queryKey: ['dashboard', 'me-invoices'],
    queryFn: fetchMyInvoices,
    enabled,
  })
}

export function useMyPayments(userId?: string, enabled = true) {
  return useQuery({
    queryKey: ['dashboard', 'me-payments', userId ?? null],
    queryFn: () => fetchMyPayments(userId as string),
    enabled: enabled && Boolean(userId),
  })
}
