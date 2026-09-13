import { useQuery } from '@tanstack/react-query'
import { fetchProduct } from '@/lib/products-api'

export function useProduct(id: string) {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => fetchProduct(id),
    staleTime: 30_000,
    refetchOnMount: false,
  })
}
