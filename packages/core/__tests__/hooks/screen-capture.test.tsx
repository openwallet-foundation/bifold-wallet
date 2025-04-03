import { renderHook } from '@testing-library/react-native'
import { CaptureProtection } from 'react-native-capture-protection'

import usePreventScreenCapture from '../../src/hooks/screen-capture'

describe('usePreventScreenCapture', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  it('with no `active` supplied, should call preventScreenshot', () => {
    renderHook(() => usePreventScreenCapture())

    expect(CaptureProtection.preventScreenshot).toHaveBeenCalledTimes(1)
  })

  it('with no `active` supplied, should then call allowScreenshot when component is unmounted', () => {
    const { unmount } = renderHook(() => usePreventScreenCapture())

    expect(CaptureProtection.preventScreenshot).toHaveBeenCalledTimes(1)
    expect(CaptureProtection.allowScreenshot).not.toHaveBeenCalled()

    unmount()

    expect(CaptureProtection.allowScreenshot).toHaveBeenCalledTimes(1)
    expect(CaptureProtection.allowScreenshot).toHaveBeenCalledWith(true)
  })

  it('with `active` true, should call preventScreenshot', () => {
    renderHook(() => usePreventScreenCapture(true))

    expect(CaptureProtection.preventScreenshot).toHaveBeenCalledTimes(1)
  })

  it('with `active` true, should then call allowScreenshot when component is unmounted', () => {
    const { unmount } = renderHook(() => usePreventScreenCapture(true))

    expect(CaptureProtection.preventScreenshot).toHaveBeenCalledTimes(1)
    expect(CaptureProtection.allowScreenshot).not.toHaveBeenCalled()

    unmount()

    expect(CaptureProtection.allowScreenshot).toHaveBeenCalledTimes(1)
    expect(CaptureProtection.allowScreenshot).toHaveBeenCalledWith(true)
  })

  it('with `active` false, should not call screenshot methods', () => {
    renderHook(() => usePreventScreenCapture(false))

    expect(CaptureProtection.preventScreenshot).not.toHaveBeenCalled()
    expect(CaptureProtection.allowScreenshot).not.toHaveBeenCalled()
  })
})
