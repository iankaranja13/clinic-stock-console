import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateProductStock, type ProductsResponse } from '@/lib/products-api'

interface BulkUpdateInput {
  ids: number[]
  newStock: number
}

export function useBulkUpdateStock() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ ids, newStock }: BulkUpdateInput) => {
      // Fire all updates in parallel; DummyJSON's PUT is a mock and
      // doesn't persist, but this mirrors how a real bulk-update
      // endpoint call (or Promise.all of individual calls) would work.
      await Promise.all(ids.map((id) => updateProductStock(String(id), newStock)))
      return { ids, newStock }
    },

    onMutate: async ({ ids, newStock }: BulkUpdateInput) => {
      await queryClient.cancelQueries({ queryKey: ['products'] })

      const previousListsSnapshot = queryClient.getQueriesData<ProductsResponse>({
        queryKey: ['products'],
      })
      const idSet = new Set(ids)

      queryClient.setQueriesData<ProductsResponse>({ queryKey: ['products'] }, (old) => {
        if (!old) return old
        return {
          ...old,
          products: old.products.map((p) => (idSet.has(p.id) ? { ...p, stock: newStock } : p)),
        }
      })

      // Also update any individually-cached detail pages for these items.
      ids.forEach((id) => {
        queryClient.setQueryData(['product', String(id)], (old: unknown) => {
          if (!old || typeof old !== 'object') return old
          return { ...old, stock: newStock }
        })
      })

      return { previousListsSnapshot }
    },

    onError: (_err, _vars, context) => {
      context?.previousListsSnapshot?.forEach(([key, data]) => {
        queryClient.setQueryData(key, data)
      })
    },
  })
}
