import { renderHook } from '@testing-library/react-native'
import { CaptureProtection } from 'react-native-capture-protection'

import usePreventScreenCapture from '../../src/hooks/screen-capture'

describe('usePreventScreenCapture', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  it('should call preventScreenshot when no argument for `active` is supplied', () => {
    renderHook(() => usePreventScreenCapture())

    expect(CaptureProtection.preventScreenshot).toHaveBeenCalledTimes(1)
  })

  it('should call preventScreenshot when `active` is true', () => {
    renderHook(() => usePreventScreenCapture())

    expect(CaptureProtection.preventScreenshot).toHaveBeenCalledTimes(1)
  })
  
  it('should call allowScreenshot when `active` is true but component is then unmounted', () => {
    const { unmount } = renderHook(() => usePreventScreenCapture(true))
    unmount()

    expect(CaptureProtection.allowScreenshot).toHaveBeenCalledTimes(1)
    expect(CaptureProtection.allowScreenshot).toHaveBeenCalledWith(true)
  })

  it('should not call screenshot methods when `active` is false', () => {
    renderHook(() => usePreventScreenCapture(false))

    expect(CaptureProtection.preventScreenshot).not.toHaveBeenCalled()
    expect(CaptureProtection.allowScreenshot).not.toHaveBeenCalled()
  })
})