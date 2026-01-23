import { fireEvent, render, waitFor, act } from '@testing-library/react-native'
import React from 'react'
import { container } from 'tsyringe'

import { ContainerProvider } from '../../src/container-api'
import { MainContainer } from '../../src/container-impl'
import { AuthContext } from '../../src/contexts/auth'
import { StoreProvider, defaultState } from '../../src/contexts/store'
import PINVerify, { PINEntryUsage } from '../../src/screens/PINVerify'
import authContext from '../contexts/auth'
import { testIdWithKey } from '../../src/utils/testable'

describe('PINVerify Screen', () => {
  test('PIN Verify renders correctly', () => {
    const main = new MainContainer(container.createChildContainer()).init()
    const tree = render(
      <ContainerProvider value={main}>
        <StoreProvider
          initialState={{
            ...defaultState,
          }}
        >
          <AuthContext.Provider value={authContext}>
            <PINVerify setAuthenticated={jest.fn()} />
          </AuthContext.Provider>
        </StoreProvider>
      </ContainerProvider>
    )
    expect(tree).toMatchSnapshot()
  })

  test('PIN Verify renders correctly for biometrics change', () => {
    const main = new MainContainer(container.createChildContainer()).init()
    const tree = render(
      <ContainerProvider value={main}>
        <StoreProvider
          initialState={{
            ...defaultState,
          }}
        >
          <AuthContext.Provider value={authContext}>
            <PINVerify setAuthenticated={jest.fn()} usage={PINEntryUsage.ChangeBiometrics} />
          </AuthContext.Provider>
        </StoreProvider>
      </ContainerProvider>
    )
    expect(tree).toMatchSnapshot()
  })
  test('Keyboard submits PIN on enter', async () => {
    const main = new MainContainer(container.createChildContainer()).init()
    const tree = render(
      <ContainerProvider value={main}>
        <StoreProvider
          initialState={{
            ...defaultState,
          }}
        >
          <AuthContext.Provider value={authContext}>
            <PINVerify setAuthenticated={jest.fn()} usage={PINEntryUsage.ChangeBiometrics} />
          </AuthContext.Provider>
        </StoreProvider>
      </ContainerProvider>
    )
    expect(tree).toMatchSnapshot()

    const pinInput = tree.getByTestId(testIdWithKey('BiometricChangedEnterPIN'))
    expect(pinInput).not.toBeNull()

    fireEvent.changeText(pinInput, '123456')
    // Allow the PIN change to propagate (and inline errors to clear) before submitting
    await act(async () => {})

    fireEvent(pinInput, 'submitEditing', { nativeEvent: { text: '123456' } })

    // This assumes the PIN verify fails. If mocks are set up later this will need to also look for the success modal.
    await waitFor(() => {
      expect(tree.queryByText('PINEnter.IncorrectPIN')).not.toBeNull()
    })
  })
})
