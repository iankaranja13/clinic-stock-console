import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateProductStock, type Product, type ProductsResponse } from '@/lib/products-api'

export function useUpdateStock(productId: string) {
  const queryClient = useQueryClient()
  const detailKey = ['product', productId]

  return useMutation({
    mutationFn: (newStock: number) => updateProductStock(productId, newStock),

    onMutate: async (newStock: number) => {
      await queryClient.cancelQueries({ queryKey: detailKey })

      const previousProduct = queryClient.getQueryData<Product>(detailKey)
      const previousListsSnapshot = queryClient.getQueriesData<ProductsResponse>({
        queryKey: ['products'],
      })

      // Update the detail cache
      queryClient.setQueryData<Product>(detailKey, (old) =>
        old ? { ...old, stock: newStock } : old
      )

      // Update the stock number on this item wherever it appears in any
      // cached stock list page (different filters/pages may each hold
      // their own cached copy of this product).
      queryClient.setQueriesData<ProductsResponse>({ queryKey: ['products'] }, (old) => {
        if (!old) return old
        return {
          ...old,
          products: old.products.map((p) =>
            p.id === Number(productId) ? { ...p, stock: newStock } : p
          ),
        }
      })

      return { previousProduct, previousListsSnapshot }
    },

    onError: (_err, _newStock, context) => {
      if (context?.previousProduct) {
        queryClient.setQueryData(detailKey, context.previousProduct)
      }
      // Roll back every list query we touched, using its own snapshot.
      context?.previousListsSnapshot?.forEach(([key, data]) => {
        queryClient.setQueryData(key, data)
      })
    },

    // Deliberately no onSettled refetch: DummyJSON's PUT doesn't persist
    // server-side, so refetching a "successful" save would make the
    // update appear to revert. We trust the optimistic cache updates
    // (both detail and list) instead once the mutation succeeds.
  })
}
