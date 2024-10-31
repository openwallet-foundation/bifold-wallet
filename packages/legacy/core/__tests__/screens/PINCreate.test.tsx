import { render } from '@testing-library/react-native'
import React from 'react'

import { AuthContext } from '../../App/contexts/auth'
import { StoreProvider, defaultState } from '../../App/contexts/store'
import PINCreate from '../../App/screens/PINCreate'
import { testIdWithKey } from '../../App/utils/testable'
import authContext from '../contexts/auth'
import { ContainerProvider } from '../../App/container-api'
import { MainContainer } from '../../App/container-impl'
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
            <PINCreate route={{} as any} navigation={jest.fn() as any} setAuthenticated={jest.fn()} explainedStatus={true} />
          </AuthContext.Provider>
        </StoreProvider>
      </ContainerProvider>
    )
    
    // Causes RangeError: Invalid string length
    // expect(tree).toMatchSnapshot()
    const pinInput1 = tree.getByTestId(testIdWithKey('EnterPIN'))
    const pinInput2 = tree.getByTestId(testIdWithKey('ReenterPIN'))
    expect(pinInput1).not.toBe(null)
    expect(pinInput2).not.toBe(null)
  })
})
