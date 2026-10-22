import { useQuery } from '@tanstack/react-query'

import {
  fetchArrearsReport,
  fetchCashBalancesReport,
  fetchEventBudgetReport,
  fetchIncomeExpenseReport,
  fetchReportEvents,
  type ArrearsQuery,
  type IncomeExpenseQuery,
} from '@/features/report/api'

export function useArrearsReport(params: ArrearsQuery = {}) {
  return useQuery({
    queryKey: ['reports', 'arrears', params],
    queryFn: () => fetchArrearsReport(params),
  })
}

export function useCashBalancesReport(buildingId?: string) {
  return useQuery({
    queryKey: ['reports', 'cash-balances', buildingId ?? null],
    queryFn: () => fetchCashBalancesReport(buildingId),
  })
}

export function useIncomeExpenseReport(
  params: IncomeExpenseQuery = {},
  enabled = true,
) {
  return useQuery({
    queryKey: ['reports', 'income-vs-expense', params],
    queryFn: () => fetchIncomeExpenseReport(params),
    enabled,
  })
}

export function useEventBudgetReport(eventId: string, enabled = true) {
  return useQuery({
    queryKey: ['reports', 'event-budget', eventId],
    queryFn: () => fetchEventBudgetReport(eventId),
    enabled: enabled && Boolean(eventId),
  })
}

export function useReportEvents() {
  return useQuery({
    queryKey: ['reports', 'events'],
    queryFn: fetchReportEvents,
  })
}
