import { useQuery } from '@tanstack/react-query'
import { fetchCategories } from '@/lib/products-api'

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
    staleTime: Infinity, // categories don't change during a session
  })
}
