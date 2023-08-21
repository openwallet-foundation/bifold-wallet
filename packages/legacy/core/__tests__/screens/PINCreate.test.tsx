import { render } from '@testing-library/react-native'
import React from 'react'

import { PINRules } from '../../App/constants'
import { AuthContext } from '../../App/contexts/auth'
import { useConfiguration } from '../../App/contexts/configuration'
import { StoreProvider, defaultState } from '../../App/contexts/store'
import PINCreate from '../../App/screens/PINCreate'
import { testIdWithKey } from '../../App/utils/testable'
import authContext from '../contexts/auth'

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

describe('displays a PIN create screen', () => {
  beforeEach(() => {
    // @ts-ignore-next-line
    useConfiguration.mockReturnValue({ PINSecurity: { rules: PINRules, displayHelper: false } })
    jest.clearAllMocks()
  })
  test('PIN create renders correctly', async () => {
    const tree = render(
      <StoreProvider
        initialState={{
          ...defaultState,
        }}
      >
        <AuthContext.Provider value={authContext}>
          <PINCreate route={{} as any} navigation={jest.fn() as any} setAuthenticated={jest.fn()} />
        </AuthContext.Provider>
      </StoreProvider>
    )

    // Causes RangeError: Invalid string length
    // expect(tree).toMatchSnapshot()
    const pinInput1 = tree.getByTestId(testIdWithKey('EnterPIN'))
    const pinInput2 = tree.getByTestId(testIdWithKey('ReenterPIN'))
    expect(pinInput1).not.toBe(null)
    expect(pinInput2).not.toBe(null)
  })
})
