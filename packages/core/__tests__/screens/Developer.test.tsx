import { act, fireEvent, render } from '@testing-library/react-native'
import React from 'react'

import Developer from '../../src/screens/Developer'
import { testIdWithKey } from '../../src/utils/testable'

describe('Developer Screen', () => {
  beforeEach(() => {
    // Silence console.error because it will print a warning about Switch
    // "Warning: dispatchCommand was called with a ref ...".
    jest.spyOn(console, 'error').mockImplementation(() => {
      return null
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  test('screen renders correctly', () => {
    const tree = render(<Developer />)

    expect(tree).toMatchSnapshot()
  })

  test('pressables exist', async () => {
    const { findByTestId } = render(<Developer />)

    const VerifierToggle = await findByTestId(testIdWithKey('ToggleVerifierCapability'))
    const DevCredentialsToggle = await findByTestId(testIdWithKey('ToggleAcceptDevCredentials'))
    const ConnectionToggle = await findByTestId(testIdWithKey('ToggleConnectionInviterCapabilitySwitch'))
    const DevVerifierToggle = await findByTestId(testIdWithKey('ToggleDevVerifierTemplatesSwitch'))
    const WalletNamingToggle = await findByTestId(testIdWithKey('ToggleEnableWalletNamingSwitch'))
    const PreventAutoLockToggle = await findByTestId(testIdWithKey('TogglePreventAutoLockSwitch'))

    expect(VerifierToggle).not.toBe(null)
    expect(DevCredentialsToggle).not.toBe(null)
    expect(ConnectionToggle).not.toBe(null)
    expect(DevVerifierToggle).not.toBe(null)
    expect(WalletNamingToggle).not.toBe(null)
    expect(PreventAutoLockToggle).not.toBe(null)
  })

  test('useVerifierCapability can be toggled', async () => {
    const tree = render(<Developer />)

    const VerifierSwitch = await tree.findByTestId(testIdWithKey('VerifierCapabilitySwitchElement'))
    await act(async () => {
      fireEvent(VerifierSwitch, 'onValueChange')
    })
    expect(tree).toMatchSnapshot()
  })

  test('acceptDevCredentials can be toggled', async () => {
    const tree = render(<Developer />)

    const AcceptDevCredentialsSwitch = await tree.findByTestId(testIdWithKey('AcceptDevCredentialsSwitchElement'))
    await act(async () => {
      fireEvent(AcceptDevCredentialsSwitch, 'onValueChange')
    })
    expect(tree).toMatchSnapshot()
  })

  test('useConnectionInviterCapability can be toggled', async () => {
    const tree = render(<Developer />)

    const ConnectionInviterCapabilitySwitch = await tree.findByTestId(
      testIdWithKey('ConnectionInviterCapabilitySwitchElement')
    )
    await act(async () => {
      fireEvent(ConnectionInviterCapabilitySwitch, 'onValueChange')
    })
    expect(tree).toMatchSnapshot()
  })

  test('useDevVerifierTemplates can be toggled', async () => {
    const tree = render(<Developer />)

    const DevVerifierTemplatesSwitch = await tree.findByTestId(testIdWithKey('DevVerifierTemplatesSwitchElement'))
    await act(async () => {
      fireEvent(DevVerifierTemplatesSwitch, 'onValueChange')
    })
    expect(tree).toMatchSnapshot()
  })

  test('enableWalletNaming can be toggled', async () => {
    const tree = render(<Developer />)

    const EnableWalletNamingSwitch = await tree.findByTestId(testIdWithKey('EnableWalletNamingSwitchElement'))
    await act(async () => {
      fireEvent(EnableWalletNamingSwitch, 'onValueChange')
    })
    expect(tree).toMatchSnapshot()
  })

  test('preventAutoLock can be toggled', async () => {
    const tree = render(<Developer />)

    const PreventAutoLockSwitch = await tree.findByTestId(testIdWithKey('PreventAutoLockSwitchElement'))
    await act(async () => {
      fireEvent(PreventAutoLockSwitch, 'onValueChange')
    })
    expect(tree).toMatchSnapshot()
  })
})
