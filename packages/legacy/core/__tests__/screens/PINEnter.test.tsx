import { render } from '@testing-library/react-native'
import React from 'react'

import { AuthContext } from '../../App/contexts/auth'
import { StoreProvider, defaultState } from '../../App/contexts/store'
import PINEnter from '../../App/screens/PINEnter'
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

describe('displays a PIN Enter screen', () => {
  test('PIN Enter renders correctly', () => {
    const tree = render(
      <StoreProvider
        initialState={{
          ...defaultState,
        }}
      >
        <AuthContext.Provider value={authContext}>
          <PINEnter setAuthenticated={jest.fn()} />
        </AuthContext.Provider>
      </StoreProvider>
    )
    expect(tree).toMatchSnapshot()
  })

  test('PIN Enter renders correctly when logged out message is present', async () => {
    const tree = render(
      <StoreProvider
        initialState={{
          ...defaultState,
          lockout: {
            displayNotification: true,
          },
        }}
      >
        <AuthContext.Provider value={authContext}>
          <PINEnter setAuthenticated={jest.fn()} />
        </AuthContext.Provider>
      </StoreProvider>
    )
    const ModalHeader = await tree.getByTestId(testIdWithKey('HeaderText'))
    expect(ModalHeader).not.toBeNull()
    expect(tree).toMatchSnapshot()
  })

  test('PIN Enter button exists', async () => {
    const tree = render(
      <StoreProvider
        initialState={{
          ...defaultState,
        }}
      >
        <AuthContext.Provider value={authContext}>
          <PINEnter setAuthenticated={jest.fn()} />
        </AuthContext.Provider>
      </StoreProvider>
    )
    const EnterButton = await tree.getByTestId(testIdWithKey('Enter'))
    expect(EnterButton).not.toBeNull()
  })
})
