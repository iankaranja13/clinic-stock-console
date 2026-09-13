import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useDebounce } from './useDebounce'

export function useStockListParams() {
  const [searchParams, setSearchParams] = useSearchParams()

  const search = searchParams.get('search') ?? ''
  const category = searchParams.get('category') ?? ''
  const sortBy = searchParams.get('sortBy') ?? 'title'
  const order = (searchParams.get('order') as 'asc' | 'desc') ?? 'asc'
  const page = Number(searchParams.get('page') ?? '1')

  // Local state so the input feels instant as the user types; only
  // pushed to the URL (and thus triggers a refetch) after a pause.
  const [searchInput, setSearchInput] = useState(search)
  const debouncedSearch = useDebounce(searchInput, 400)

  useEffect(() => {
    if (debouncedSearch === search) return
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (debouncedSearch) {
        next.set('search', debouncedSearch)
      } else {
        next.delete('search')
      }
      next.set('page', '1')
      return next
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-run when the debounced value changes
  }, [debouncedSearch])

  function setCategory(newCategory: string) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (newCategory) {
        next.set('category', newCategory)
      } else {
        next.delete('category')
      }
      next.set('page', '1')
      return next
    })
  }

  function setSort(newSortBy: string, newOrder: 'asc' | 'desc') {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.set('sortBy', newSortBy)
      next.set('order', newOrder)
      next.set('page', '1')
      return next
    })
  }

  function setPage(newPage: number) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.set('page', String(newPage))
      return next
    })
  }

  return {
    search,
    category,
    sortBy,
    order,
    page,
    searchInput,
    setSearchInput,
    setCategory,
    setSort,
    setPage,
  }
}
