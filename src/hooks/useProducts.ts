import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { fetchProducts, type FetchProductsParams } from '@/lib/products-api'

export function useProducts(params: FetchProductsParams) {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => fetchProducts(params),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
    refetchOnMount: false,
  })
}
