import { act, renderHook, waitFor } from '@testing-library/react-native'
import { AccessibilityInfo } from 'react-native'

import { useServices } from '../../src/container-api'
import { useInvertColorsEnabled } from '../../src/hooks/useInvertColorsEnabled'

jest.mock('../../src/container-api', () => ({
  useServices: jest.fn(),
  TOKENS: {
    UTIL_LOGGER: 'UTIL_LOGGER',
  },
}))

// The jest preset replaces AccessibilityInfo with jest.fn()s; these give them typed handles.
const mockAddEventListener = AccessibilityInfo.addEventListener as unknown as jest.Mock
const mockIsInvertColorsEnabled = AccessibilityInfo.isInvertColorsEnabled as jest.Mock

describe('useInvertColorsEnabled', () => {
  const mockLogger = { warn: jest.fn() }
  const removeListener = jest.fn()
  let emitInvertColorsChanged: (enabled: boolean) => void

  beforeEach(() => {
    jest.clearAllMocks()
    jest.mocked(useServices).mockReturnValue([mockLogger] as never)
    mockAddEventListener.mockImplementation((_eventName: string, listener: (enabled: boolean) => void) => {
      emitInvertColorsChanged = listener
      return { remove: removeListener }
    })
    mockIsInvertColorsEnabled.mockResolvedValue(false)
  })

  test('reads the setting when mounted', async () => {
    mockIsInvertColorsEnabled.mockResolvedValue(true)

    const { result } = renderHook(() => useInvertColorsEnabled())

    expect(result.current).toBe(false)
    await waitFor(() => expect(result.current).toBe(true))
  })

  test('follows changes to the setting', async () => {
    const { result } = renderHook(() => useInvertColorsEnabled())
    await act(async () => {})

    act(() => emitInvertColorsChanged(true))
    expect(result.current).toBe(true)

    act(() => emitInvertColorsChanged(false))
    expect(result.current).toBe(false)
  })

  test('keeps a change that arrives before the initial read answers', async () => {
    let answerRead!: (enabled: boolean) => void
    mockIsInvertColorsEnabled.mockReturnValue(
      new Promise<boolean>((resolve) => {
        answerRead = resolve
      })
    )

    const { result } = renderHook(() => useInvertColorsEnabled())
    act(() => emitInvertColorsChanged(true))
    await act(async () => answerRead(false))

    expect(result.current).toBe(true)
  })

  test('listens for inversion changes only while mounted', async () => {
    const { unmount } = renderHook(() => useInvertColorsEnabled())
    await act(async () => {})

    expect(mockAddEventListener).toHaveBeenCalledWith('invertColorsChanged', expect.any(Function))
    expect(removeListener).not.toHaveBeenCalled()

    unmount()

    expect(removeListener).toHaveBeenCalledTimes(1)
  })

  test('logs and reports inversion as off when the setting cannot be read', async () => {
    mockIsInvertColorsEnabled.mockRejectedValue(new Error('AccessibilityInfo is not available'))

    const { result } = renderHook(() => useInvertColorsEnabled())

    await waitFor(() =>
      expect(mockLogger.warn).toHaveBeenCalledWith(expect.stringContaining('Could not read the colour inversion'), {
        message: 'AccessibilityInfo is not available',
      })
    )
    expect(result.current).toBe(false)
  })
})
