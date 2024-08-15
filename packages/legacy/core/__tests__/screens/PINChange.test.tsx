import { render } from '@testing-library/react-native'
import React from 'react'

import { AuthContext } from '../../App/contexts/auth'
import { StoreProvider, defaultState } from '../../App/contexts/store'
import PINCreate from '../../App/screens/PINCreate'
import { testIdWithKey } from '../../App/utils/testable'
import authContext from '../contexts/auth'
import { MainContainer } from '../../App/container-impl'
import { container } from 'tsyringe'
import { ContainerProvider } from '../../App/container-api'

describe('displays a PIN change screen', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('PIN change renders correctly', async () => {
    const main = new MainContainer(container.createChildContainer()).init()
    const route = {
      params: {
        updatePin: true,
      },
    } as any
    const tree = render(
      <ContainerProvider value={main}>
        <StoreProvider
          initialState={{
            ...defaultState,
          }}
        >
          <AuthContext.Provider value={authContext}>
            <PINCreate route={route} navigation={jest.fn() as any} setAuthenticated={jest.fn()} />
          </AuthContext.Provider>
        </StoreProvider>
      </ContainerProvider>
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
