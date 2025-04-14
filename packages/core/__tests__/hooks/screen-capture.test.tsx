import { renderHook } from '@testing-library/react-native'
import { Platform } from 'react-native'
import ScreenGuardModule from 'react-native-screenguard'

import usePreventScreenCapture, { screenGuardOptions } from '../../src/hooks/screen-capture'

describe('usePreventScreenCapture', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  it('with no `active` supplied, should call register', () => {
    renderHook(() => usePreventScreenCapture())

    expect(ScreenGuardModule.register).toHaveBeenCalledTimes(1)
    expect(ScreenGuardModule.register).toHaveBeenCalledWith(screenGuardOptions)
  })

  it('with no `active` supplied on Android, should call registerWithoutEffect', () => {
    const { OS } = Platform
    Platform.OS = 'android'
    renderHook(() => usePreventScreenCapture())

    expect(ScreenGuardModule.registerWithoutEffect).toHaveBeenCalledTimes(1)
    expect(ScreenGuardModule.register).not.toHaveBeenCalled()
    Platform.OS = OS
  })

  it('with no `active` supplied, should then call unregister when component is unmounted', () => {
    const { unmount } = renderHook(() => usePreventScreenCapture())

    expect(ScreenGuardModule.register).toHaveBeenCalledTimes(1)
    expect(ScreenGuardModule.register).toHaveBeenCalledWith(screenGuardOptions)
    expect(ScreenGuardModule.unregister).not.toHaveBeenCalled()

    unmount()

    expect(ScreenGuardModule.unregister).toHaveBeenCalledTimes(1)
  })

  it('with `active` true, should call register', () => {
    renderHook(() => usePreventScreenCapture(true))

    expect(ScreenGuardModule.register).toHaveBeenCalledTimes(1)
    expect(ScreenGuardModule.register).toHaveBeenCalledWith(screenGuardOptions)
  })

  it('with `active` true, should then call unregister when component is unmounted', () => {
    const { unmount } = renderHook(() => usePreventScreenCapture(true))

    expect(ScreenGuardModule.register).toHaveBeenCalledTimes(1)
    expect(ScreenGuardModule.register).toHaveBeenCalledWith(screenGuardOptions)
    expect(ScreenGuardModule.unregister).not.toHaveBeenCalled()

    unmount()

    expect(ScreenGuardModule.unregister).toHaveBeenCalledTimes(1)
  })

  it('with `active` false, should not call screenshot methods', () => {
    renderHook(() => usePreventScreenCapture(false))

    expect(ScreenGuardModule.register).not.toHaveBeenCalled()
    expect(ScreenGuardModule.unregister).not.toHaveBeenCalled()
  })
})
