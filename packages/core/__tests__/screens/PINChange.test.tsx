import { render } from '@testing-library/react-native'
import React from 'react'

import { AuthContext } from '../../src/contexts/auth'
import { StoreProvider, defaultState } from '../../src/contexts/store'
import PINCreate from '../../src/screens/PINCreate'
import { testIdWithKey } from '../../src/utils/testable'
import authContext from '../contexts/auth'
import { MainContainer } from '../../src/container-impl'
import { container } from 'tsyringe'
import { ContainerProvider } from '../../src/container-api'

describe('PINChange Screen', () => {
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
            <PINCreate
              route={route}
              navigation={jest.fn() as any}
              setAuthenticated={jest.fn()}
              explainedStatus={true}
            />
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
