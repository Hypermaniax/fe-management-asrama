import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  createCategory,
  deleteCategory,
  fetchCategories,
  updateCategory,
  type CategoryInput,
  type CategoryKind,
  type CategoryUpdate,
} from '@/features/category/api'

export function useCategories(kind?: CategoryKind, enabled = true) {
  return useQuery({
    queryKey: ['categories', kind ?? null],
    queryFn: () => fetchCategories(kind),
    enabled,
  })
}

function useInvalidateCategories() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: ['categories'] })
}

export function useCreateCategory() {
  const invalidate = useInvalidateCategories()
  return useMutation({
    mutationFn: (input: CategoryInput) => createCategory(input),
    onSuccess: invalidate,
  })
}

export function useUpdateCategory() {
  const invalidate = useInvalidateCategories()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: CategoryUpdate }) =>
      updateCategory(id, input),
    onSuccess: invalidate,
  })
}

export function useDeleteCategory() {
  const invalidate = useInvalidateCategories()
  return useMutation({
    mutationFn: (id: string) => deleteCategory(id),
    onSuccess: invalidate,
  })
}
