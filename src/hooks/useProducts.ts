import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { fetchProducts, type FetchProductsParams } from '@/lib/products-api'

export function useProducts(params: FetchProductsParams) {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => fetchProducts(params),
    // Keeps the previous page's data on screen while the new query is
    // in flight, instead of flashing to a loading/empty state. This is
    // also what protects against requirement #1: if the user changes
    // the search again before this request finishes, React Query
    // simply discards this response when it lands, since it's no
    // longer the query for the current key.
    placeholderData: keepPreviousData,
  })
}
