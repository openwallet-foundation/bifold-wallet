import { act, renderHook } from '@testing-library/react-native'

import { usePreventDoublePress } from '../../src/hooks/usePreventDoublePress'

describe('usePreventDoublePress', () => {
  it('invokes the wrapped callback', async () => {
    const { result } = renderHook(() => usePreventDoublePress())
    const callback = jest.fn()

    await act(() => result.current.preventDoublePress(callback)())

    expect(callback).toHaveBeenCalledTimes(1)
  })

  it('forwards arguments to the wrapped callback', async () => {
    const { result } = renderHook(() => usePreventDoublePress())
    const callback = jest.fn()

    await act(() => result.current.preventDoublePress(callback)('a', 1))

    expect(callback).toHaveBeenCalledWith('a', 1)
  })

  it('returns undefined when undefined callback is provided', () => {
    const { result } = renderHook(() => usePreventDoublePress())

    expect(result.current.preventDoublePress(undefined)).toBeUndefined()
  })

  it('returns null when null callback is provided', () => {
    const { result } = renderHook(() => usePreventDoublePress())

    expect(result.current.preventDoublePress(null)).toBeNull()
  })

  it('sets isPressing to true while the callback is pending and false once it resolves', async () => {
    const { result } = renderHook(() => usePreventDoublePress())
    let resolveCallback!: () => void
    const callback = jest.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveCallback = resolve
        })
    )

    expect(result.current.isPressing).toBe(false)

    let pressPromise!: Promise<void>
    await act(async () => {
      pressPromise = result.current.preventDoublePress(callback)()
    })

    expect(result.current.isPressing).toBe(true)

    await act(async () => {
      resolveCallback()
      await pressPromise
    })

    expect(result.current.isPressing).toBe(false)
  })

  it('ignores a second press while the first callback is still running', async () => {
    const { result } = renderHook(() => usePreventDoublePress())
    let resolveCallback!: () => void
    const callback = jest.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveCallback = resolve
        })
    )
    const wrapped = result.current.preventDoublePress(callback)

    let firstPress!: Promise<void>
    await act(async () => {
      firstPress = wrapped()
    })
    await act(async () => {
      wrapped()
    })

    expect(callback).toHaveBeenCalledTimes(1)

    await act(async () => {
      resolveCallback()
      await firstPress
    })
  })

  it('allows a new press once the previous callback has resolved', async () => {
    const { result } = renderHook(() => usePreventDoublePress())
    const callback = jest.fn().mockResolvedValue(undefined)
    const wrapped = result.current.preventDoublePress(callback)

    await act(async () => wrapped())
    await act(async () => wrapped())

    expect(callback).toHaveBeenCalledTimes(2)
  })

  it('resets the guard even when the callback rejects', async () => {
    const { result } = renderHook(() => usePreventDoublePress())
    const error = new Error('boom')
    const callback = jest.fn().mockRejectedValue(error)
    const wrapped = result.current.preventDoublePress(callback)

    await act(async () => {
      await expect(wrapped()).rejects.toThrow('boom')
    })
    expect(result.current.isPressing).toBe(false)

    const secondCallback = jest.fn()
    await act(() => result.current.preventDoublePress(secondCallback)())

    expect(secondCallback).toHaveBeenCalledTimes(1)
  })
})
