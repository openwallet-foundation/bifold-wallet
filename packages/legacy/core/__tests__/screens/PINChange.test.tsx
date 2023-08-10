import { render } from '@testing-library/react-native'
import React from 'react'

import { AuthContext } from '../../App/contexts/auth'
import PINCreate from '../../App/screens/PINCreate'
import authContext from '../contexts/auth'
import { PINRules } from '../../App/constants'
import { StoreProvider, defaultState } from '../../App/contexts/store'
import { useConfiguration } from '../../App/contexts/configuration'
import { testIdWithKey } from '../../App/utils/testable'

jest.mock('@react-navigation/core', () => {
  return require('../../__mocks__/custom/@react-navigation/core')
})
jest.mock('@react-navigation/native', () => {
  return require('../../__mocks__/custom/@react-navigation/native')
})
jest.mock('react-native-fs', () => ({}))
jest.mock('@hyperledger/anoncreds-react-native', () => ({}))
jest.mock('@hyperledger/aries-askar-react-native', () => ({}))
jest.mock('@hyperledger/indy-vdr-react-native', () => ({}))
jest.mock('../../App/contexts/configuration', () => ({
  useConfiguration: jest.fn(),
}))

describe('displays a PIN change screen', () => {
  beforeEach(() => {
    // @ts-ignore-next-line
    useConfiguration.mockReturnValue({ PINSecurity: { rules: PINRules, displayHelper: false }, enableWalletNaming: false })
    jest.clearAllMocks()
  })

  test('PIN change renders correctly', async () => {
    const route = {
      params: {
        updatePin: true
      }
    } as any
    const tree = render(
      <StoreProvider
        initialState={{
          ...defaultState,
        }}
      >
        <AuthContext.Provider value={authContext}>
          <PINCreate route={route} navigation={jest.fn() as any} setAuthenticated={jest.fn()} />
        </AuthContext.Provider>
      </StoreProvider>
    )

    // Causes RangeError: Invalid string length
    // expect(tree).toMatchSnapshot()
    const oldPinInput = tree.getByTestId(testIdWithKey('EnterOldPIN'))
    const newPinInput1 = tree.getByTestId(testIdWithKey('EnterPIN'))
    const newPinInput2 = tree.getByTestId(testIdWithKey('ReenterPIN'))
    expect(oldPinInput).not.toBe(null)
    expect(newPinInput1).not.toBe(null)
    expect(newPinInput2).not.toBe(null)
  })
})
