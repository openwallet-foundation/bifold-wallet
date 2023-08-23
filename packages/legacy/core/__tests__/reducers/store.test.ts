import storeReducer, { DispatchAction } from '../../App/contexts/reducers/store'
import { defaultState } from '../../App/contexts/store'

describe('Store reducer', () => {
  test('ENABLE_DEVELOPER_MODE sets to true', () => {
    const returnedState = storeReducer(defaultState, { type: DispatchAction.ENABLE_DEVELOPER_MODE, payload: [true] })
    expect(returnedState.preferences.developerModeEnabled).toBe(true)
  })
  test('ENABLE_DEVELOPER_MODE sets to false', () => {
    const returnedState = storeReducer(defaultState, { type: DispatchAction.ENABLE_DEVELOPER_MODE, payload: [false] })
    expect(returnedState.preferences.developerModeEnabled).toBe(false)
  })

  test('USE_BIOMETRY sets to true', () => {
    const returnedState = storeReducer(defaultState, { type: DispatchAction.USE_BIOMETRY, payload: [true] })
    expect(returnedState.preferences.useBiometry).toBe(true)
  })
  test('USE_BIOMETRY sets to false', () => {
    const returnedState = storeReducer(defaultState, { type: DispatchAction.USE_BIOMETRY, payload: [false] })
    expect(returnedState.preferences.useBiometry).toBe(false)
  })

  test('USE_VERIFIER_CAPABILITY sets to true', () => {
    const returnedState = storeReducer(defaultState, { type: DispatchAction.USE_VERIFIER_CAPABILITY, payload: [true] })
    expect(returnedState.preferences.useVerifierCapability).toBe(true)
  })
  test('USE_VERIFIER_CAPABILITY sets to false', () => {
    const returnedState = storeReducer(defaultState, { type: DispatchAction.USE_VERIFIER_CAPABILITY, payload: [false] })
    expect(returnedState.preferences.useVerifierCapability).toBe(false)
  })

  test('USE_CONNECTION_INVITER_CAPABILITY sets to true', () => {
    const returnedState = storeReducer(defaultState, {
      type: DispatchAction.USE_CONNECTION_INVITER_CAPABILITY,
      payload: [true],
    })
    expect(returnedState.preferences.useConnectionInviterCapability).toBe(true)
  })
  test('USE_CONNECTION_INVITER_CAPABILITY sets to false', () => {
    const returnedState = storeReducer(defaultState, {
      type: DispatchAction.USE_CONNECTION_INVITER_CAPABILITY,
      payload: [false],
    })
    expect(returnedState.preferences.useConnectionInviterCapability).toBe(false)
  })

  test('USE_DEV_VERIFIER_TEMPLATES sets to true', () => {
    const returnedState = storeReducer(defaultState, {
      type: DispatchAction.USE_DEV_VERIFIER_TEMPLATES,
      payload: [true],
    })
    expect(returnedState.preferences.useDevVerifierTemplates).toBe(true)
  })
  test('USE_DEV_VERIFIER_TEMPLATES sets to false', () => {
    const returnedState = storeReducer(defaultState, {
      type: DispatchAction.USE_DEV_VERIFIER_TEMPLATES,
      payload: [false],
    })
    expect(returnedState.preferences.useDevVerifierTemplates).toBe(false)
  })

  test('ACCEPT_DEV_CREDENTIALS sets to true', () => {
    const returnedState = storeReducer(defaultState, { type: DispatchAction.ACCEPT_DEV_CREDENTIALS, payload: [true] })
    expect(returnedState.preferences.acceptDevCredentials).toBe(true)
  })
  test('ACCEPT_DEV_CREDENTIALS sets to false', () => {
    const returnedState = storeReducer(defaultState, { type: DispatchAction.ACCEPT_DEV_CREDENTIALS, payload: [false] })
    expect(returnedState.preferences.acceptDevCredentials).toBe(false)
  })

  test('USE_DATA_RETENTION sets to true', () => {
    const returnedState = storeReducer(defaultState, { type: DispatchAction.USE_DATA_RETENTION, payload: [true] })
    expect(returnedState.preferences.useDataRetention).toBe(true)
  })
  test('USE_DATA_RETENTION sets to false', () => {
    const returnedState = storeReducer(defaultState, { type: DispatchAction.USE_DATA_RETENTION, payload: [false] })
    expect(returnedState.preferences.useDataRetention).toBe(false)
  })

  test('ENABLE_WALLET_NAMING sets to true', () => {
    const returnedState = storeReducer(defaultState, { type: DispatchAction.ENABLE_WALLET_NAMING, payload: [true] })
    expect(returnedState.preferences.enableWalletNaming).toBe(true)
  })
  test('ENABLE_WALLET_NAMING sets to false', () => {
    const returnedState = storeReducer(defaultState, { type: DispatchAction.ENABLE_WALLET_NAMING, payload: [false] })
    expect(returnedState.preferences.enableWalletNaming).toBe(false)
  })

  test('PREVENT_AUTO_LOCK sets to true', () => {
    const returnedState = storeReducer(defaultState, { type: DispatchAction.PREVENT_AUTO_LOCK, payload: [true] })
    expect(returnedState.preferences.preventAutoLock).toBe(true)
  })
  test('PREVENT_AUTO_LOCK sets to false', () => {
    const returnedState = storeReducer(defaultState, { type: DispatchAction.PREVENT_AUTO_LOCK, payload: [false] })
    expect(returnedState.preferences.preventAutoLock).toBe(false)
  })
})
