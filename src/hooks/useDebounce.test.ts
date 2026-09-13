import { renderHook, act } from '@testing-library/react'
import { useDebounce } from './useDebounce'

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns the initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('a', 400))
    expect(result.current).toBe('a')
  })

  it('does not update before the delay has passed', () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 400), {
      initialProps: { value: 'a' },
    })

    rerender({ value: 'ab' })
    act(() => {
      vi.advanceTimersByTime(200)
    })

    expect(result.current).toBe('a')
  })

  it('updates to the latest value after the delay passes', () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 400), {
      initialProps: { value: 'a' },
    })

    rerender({ value: 'ab' })
    act(() => {
      vi.advanceTimersByTime(400)
    })

    expect(result.current).toBe('ab')
  })

  it('only reflects the final value when changed rapidly, not each intermediate one', () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 400), {
      initialProps: { value: 'a' },
    })

    rerender({ value: 'ab' })
    act(() => {
      vi.advanceTimersByTime(100)
    })
    rerender({ value: 'abc' })
    act(() => {
      vi.advanceTimersByTime(100)
    })
    rerender({ value: 'abcd' })
    act(() => {
      vi.advanceTimersByTime(400)
    })

    // Only the final value should ever be committed — this is the
    // behavior that stops the search box from firing a fetch for
    // every keystroke.
    expect(result.current).toBe('abcd')
  })
})
