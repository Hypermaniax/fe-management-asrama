import { apiFetch, type ApiEnvelope } from '@/lib/api'

export type CategoryKind = 'INCOME' | 'EXPENSE'

export type Category = {
  id: string
  buildingId: string
  name: string
  kind: CategoryKind
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

export type CategoryInput = {
  buildingId: string
  name: string
  kind: CategoryKind
}

export type CategoryUpdate = {
  name?: string
  kind?: CategoryKind
}

export async function fetchCategories(kind?: CategoryKind) {
  const query = kind ? `?kind=${kind}` : ''
  const res = await apiFetch<ApiEnvelope<Category[]>>(`/categories${query}`)
  return res.data
}

export function createCategory(input: CategoryInput) {
  return apiFetch<ApiEnvelope<Category>>('/categories', {
    method: 'POST',
    body: input,
  })
}

export function updateCategory(id: string, input: CategoryUpdate) {
  return apiFetch<ApiEnvelope<Category>>(`/categories/${id}`, {
    method: 'PATCH',
    body: input,
  })
}

export function deleteCategory(id: string) {
  return apiFetch<{ status: string }>(`/categories/${id}`, { method: 'DELETE' })
}
