import { renderHook } from '@testing-library/react-native'
import { CaptureProtection } from 'react-native-capture-protection'
import { container } from 'tsyringe'

import { TOKENS } from '../../src/container-api'
import { MainContainer } from '../../src/container-impl'
import usePreventScreenCapture from '../../src/hooks/screen-capture'
import { CustomBasicAppContext } from '../helpers/app'

describe('usePreventScreenCapture', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  it('should call preventScreenshot when preventScreenCapture is true', () => {
    const context = new MainContainer(container.createChildContainer()).init()
    const config = context.resolve(TOKENS.CONFIG)
    context.container.registerInstance(TOKENS.CONFIG, { ...config, preventScreenCapture: true })
    renderHook(() => usePreventScreenCapture(), {
      wrapper: ({ children }) => (
        <CustomBasicAppContext container={context}>{children}</CustomBasicAppContext>
      ),  
    })

    expect(CaptureProtection.preventScreenshot).toHaveBeenCalledTimes(1)
  })
  
  it('should call allowScreenshot when preventScreenCapture is true but component is then unmounted', () => {
    const context = new MainContainer(container.createChildContainer()).init()
    const config = context.resolve(TOKENS.CONFIG)
    context.container.registerInstance(TOKENS.CONFIG, { ...config, preventScreenCapture: true })
    const { unmount } = renderHook(() => usePreventScreenCapture(true), {
      wrapper: ({ children }) => (
        <CustomBasicAppContext container={context}>{children}</CustomBasicAppContext>
      ),  
    })

    unmount()

    expect(CaptureProtection.allowScreenshot).toHaveBeenCalledTimes(1)
    expect(CaptureProtection.allowScreenshot).toHaveBeenCalledWith(true)
  })
  
  it('should call preventScreenshot when preventScreenCapture is true and active is true', () => {
    const context = new MainContainer(container.createChildContainer()).init()
    const config = context.resolve(TOKENS.CONFIG)
    context.container.registerInstance(TOKENS.CONFIG, { ...config, preventScreenCapture: true })
    renderHook(() => usePreventScreenCapture(true), {
      wrapper: ({ children }) => (
        <CustomBasicAppContext container={context}>{children}</CustomBasicAppContext>
      ),  
    })

    expect(CaptureProtection.preventScreenshot).toHaveBeenCalledTimes(1)
  })
  
  it('should not call preventScreenshot when preventScreenCapture is true and active is false', () => {
    const context = new MainContainer(container.createChildContainer()).init()
    const config = context.resolve(TOKENS.CONFIG)
    context.container.registerInstance(TOKENS.CONFIG, { ...config, preventScreenCapture: true })
    renderHook(() => usePreventScreenCapture(false), {
      wrapper: ({ children }) => (
        <CustomBasicAppContext container={context}>{children}</CustomBasicAppContext>
      ),  
    })

    expect(CaptureProtection.preventScreenshot).not.toHaveBeenCalled()
    expect(CaptureProtection.allowScreenshot).not.toHaveBeenCalled()
  })
  
  it('should not call preventScreenshot when preventScreenCapture is false and active is false', () => {
    const context = new MainContainer(container.createChildContainer()).init()
    const config = context.resolve(TOKENS.CONFIG)
    context.container.registerInstance(TOKENS.CONFIG, { ...config, preventScreenCapture: false })
    renderHook(() => usePreventScreenCapture(false), {
      wrapper: ({ children }) => (
        <CustomBasicAppContext container={context}>{children}</CustomBasicAppContext>
      ),  
    })

    expect(CaptureProtection.preventScreenshot).not.toHaveBeenCalled()
    expect(CaptureProtection.allowScreenshot).not.toHaveBeenCalled()
  })
  
  it('should not call preventScreenshot when preventScreenCapture is false and active is true', () => {
    const context = new MainContainer(container.createChildContainer()).init()
    const config = context.resolve(TOKENS.CONFIG)
    context.container.registerInstance(TOKENS.CONFIG, { ...config, preventScreenCapture: false })
    renderHook(() => usePreventScreenCapture(true), {
      wrapper: ({ children }) => (
        <CustomBasicAppContext container={context}>{children}</CustomBasicAppContext>
      ),  
    })

    expect(CaptureProtection.preventScreenshot).not.toHaveBeenCalled()
    expect(CaptureProtection.allowScreenshot).not.toHaveBeenCalled()
  })
})