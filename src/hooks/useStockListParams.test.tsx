import { renderHook, act } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useStockListParams } from './useStockListParams'

function wrapper({ children }: { children: ReactNode }) {
  return <MemoryRouter initialEntries={['/?page=3']}>{children}</MemoryRouter>
}

describe('useStockListParams', () => {
  it('resets to page 1 when the category filter changes', () => {
    const { result } = renderHook(() => useStockListParams(), { wrapper })

    expect(result.current.page).toBe(3)

    act(() => {
      result.current.setCategory('smartphones')
    })

    expect(result.current.page).toBe(1)
    expect(result.current.category).toBe('smartphones')
  })

  it('resets to page 1 when the sort order changes', () => {
    const { result } = renderHook(() => useStockListParams(), { wrapper })

    expect(result.current.page).toBe(3)

    act(() => {
      result.current.setSort('price', 'desc')
    })

    expect(result.current.page).toBe(1)
    expect(result.current.sortBy).toBe('price')
    expect(result.current.order).toBe('desc')
  })

  it('does not reset the page when setPage is called directly', () => {
    const { result } = renderHook(() => useStockListParams(), { wrapper })

    act(() => {
      result.current.setPage(5)
    })

    expect(result.current.page).toBe(5)
  })
})
