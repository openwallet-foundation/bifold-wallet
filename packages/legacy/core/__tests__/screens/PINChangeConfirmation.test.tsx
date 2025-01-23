import { render } from '@testing-library/react-native'
import React from 'react'

import { AuthContext } from '../../App/contexts/auth'
import { StoreProvider, defaultState } from '../../App/contexts/store'
import PINChangeConfirmation from '../../App/screens/PINChangeConfirmation'
import { testIdWithKey } from '../../App/utils/testable'
import authContext from '../contexts/auth'
import { MainContainer } from '../../App/container-impl'
import { container } from 'tsyringe'
import { ContainerProvider } from '../../App/container-api'

describe('PINChange Screen', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('PIN change renders correctly', async () => {
    const main = new MainContainer(container.createChildContainer()).init()
    const tree = render(
      <ContainerProvider value={main}>
        <StoreProvider
          initialState={{
            ...defaultState,
          }}
        >
          <AuthContext.Provider value={authContext}>
            <PINChangeConfirmation />
          </AuthContext.Provider>
        </StoreProvider>
      </ContainerProvider>
    )

    // Causes RangeError: Invalid string length
    // expect(tree).toMatchSnapshot()
    const confirmationInfoBoxTitle = tree.getByTestId(testIdWithKey('HeaderText'))
    const confirmationInfoBoxSubtext = tree.getByTestId(testIdWithKey('BodyText'))
    const backToHomeButton = tree.getByTestId(testIdWithKey('GoToHomeButton'))
    expect(confirmationInfoBoxTitle).not.toBe(null)
    expect(confirmationInfoBoxSubtext).not.toBe(null)
    expect(backToHomeButton).not.toBe(null)
  })
})
