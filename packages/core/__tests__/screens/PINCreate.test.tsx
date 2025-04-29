import { render } from '@testing-library/react-native'
import React from 'react'

import { AuthContext } from '../../src/contexts/auth'
import { StoreProvider, defaultState } from '../../src/contexts/store'
import PINCreate from '../../src/screens/PINCreate'
import { testIdWithKey } from '../../src/utils/testable'
import authContext from '../contexts/auth'
import { ContainerProvider } from '../../src/container-api'
import { MainContainer } from '../../src/container-impl'
import { container } from 'tsyringe'

describe('PINCreate Screen', () => {
  test('PIN create renders correctly', async () => {
    const main = new MainContainer(container.createChildContainer()).init()
    const tree = render(
      <ContainerProvider value={main}>
        <StoreProvider
          initialState={{
            ...defaultState,
          }}
        >
          <AuthContext.Provider value={authContext}>
            <PINCreate
              route={{} as any}
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
    const continueButton = await tree.queryByTestId(testIdWithKey('ContinueCreatePIN'))
    expect(continueButton).toBeFalsy()
    const pinInput1 = tree.getByTestId(testIdWithKey('EnterPIN'))
    const pinInput2 = tree.getByTestId(testIdWithKey('ReenterPIN'))
    expect(pinInput1).not.toBe(null)
    expect(pinInput2).not.toBe(null)
  })

  test('PIN Explainer pops up correctly', async () => {
    const main = new MainContainer(container.createChildContainer()).init()
    const tree = render(
      <ContainerProvider value={main}>
        <StoreProvider
          initialState={{
            ...defaultState,
          }}
        >
          <AuthContext.Provider value={authContext}>
            <PINCreate
              route={{} as any}
              navigation={jest.fn() as any}
              setAuthenticated={jest.fn()}
              explainedStatus={false}
            />
          </AuthContext.Provider>
        </StoreProvider>
      </ContainerProvider>
    )

    // Causes RangeError: Invalid string length
    // expect(tree).toMatchSnapshot()
    const continueButton = tree.getByTestId(testIdWithKey('ContinueCreatePIN'))
    expect(continueButton).not.toBe(null)
    const pinInput1 = await tree.queryByTestId(testIdWithKey('EnterPIN'))
    const pinInput2 = await tree.queryByTestId(testIdWithKey('ReenterPIN'))
    expect(pinInput1).toBeFalsy()
    expect(pinInput2).toBeFalsy()
  })
})
