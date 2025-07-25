import { render, fireEvent, waitFor, act } from '@testing-library/react-native'
import React from 'react'
import { container } from 'tsyringe'
import { Keyboard } from 'react-native'

import { ContainerProvider } from '../../src/container-api'
import { MainContainer } from '../../src/container-impl'
import { AuthContext } from '../../src/contexts/auth'
import { StoreProvider, defaultState } from '../../src/contexts/store'
import PINEnter from '../../src/screens/PINEnter'
import { testIdWithKey } from '../../src/utils/testable'
import authContext from '../contexts/auth'

describe('PINEnter Screen', () => {
  test('PIN Enter renders correctly', () => {
    const main = new MainContainer(container.createChildContainer()).init()
    const tree = render(
      <ContainerProvider value={main}>
        <StoreProvider
          initialState={{
            ...defaultState,
          }}
        >
          <AuthContext.Provider value={authContext}>
            <PINEnter setAuthenticated={jest.fn()} />
          </AuthContext.Provider>
        </StoreProvider>
      </ContainerProvider>
    )
    expect(tree).toMatchSnapshot()
  })

  test('PIN Enter renders correctly when logged out message is present', async () => {
    const main = new MainContainer(container.createChildContainer()).init()
    const tree = render(
      <ContainerProvider value={main}>
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
      </ContainerProvider>
    )
    const textNotice = await tree.findByText('PINEnter.LockedOut')
    expect(textNotice).not.toBeNull()
    expect(tree).toMatchSnapshot()
  })

  test('PIN Enter button exists', async () => {
    const main = new MainContainer(container.createChildContainer()).init()
    const tree = render(
      <ContainerProvider value={main}>
        <StoreProvider
          initialState={{
            ...defaultState,
          }}
        >
          <AuthContext.Provider value={authContext}>
            <PINEnter setAuthenticated={jest.fn()} />
          </AuthContext.Provider>
        </StoreProvider>
      </ContainerProvider>
    )
    const EnterButton = await tree.getByTestId(testIdWithKey('Enter'))
    expect(EnterButton).not.toBeNull()
  })

  test('Forgot PIN link exists', async () => {
    const main = new MainContainer(container.createChildContainer()).init()
    const tree = render(
      <ContainerProvider value={main}>
        <StoreProvider
          initialState={{
            ...defaultState,
          }}
        >
          <AuthContext.Provider value={authContext}>
            <PINEnter setAuthenticated={jest.fn()} />
          </AuthContext.Provider>
        </StoreProvider>
      </ContainerProvider>
    )
    const forgotPinLink = await tree.getByTestId(testIdWithKey('ForgotPINLink'))
    expect(forgotPinLink).not.toBeNull()
  })

  test('Forgot PIN link displays popup modal on press', async () => {
    const main = new MainContainer(container.createChildContainer()).init()
    const tree = render(
      <ContainerProvider value={main}>
        <StoreProvider
          initialState={{
            ...defaultState,
          }}
        >
          <AuthContext.Provider value={authContext}>
            <PINEnter setAuthenticated={jest.fn()} />
          </AuthContext.Provider>
        </StoreProvider>
      </ContainerProvider>
    )
    const forgotPinLink = await tree.getByTestId(testIdWithKey('ForgotPINLink'))
    act(() => {
      forgotPinLink.props.onPress()
    })
    const popupModal = await tree.getByTestId(testIdWithKey('ForgotPINModalDescription'))
    expect(popupModal).not.toBeNull()
  })

  test('Forgot PIN modal is closed on close button press', async () => {
    const main = new MainContainer(container.createChildContainer()).init()
    const tree = render(
      <ContainerProvider value={main}>
        <StoreProvider
          initialState={{
            ...defaultState,
          }}
        >
          <AuthContext.Provider value={authContext}>
            <PINEnter setAuthenticated={jest.fn()} />
          </AuthContext.Provider>
        </StoreProvider>
      </ContainerProvider>
    )
    const forgotPinLink = await tree.getByTestId(testIdWithKey('ForgotPINLink'))
    act(() => {
      forgotPinLink.props.onPress()
    })
    const okayButton = await tree.getByLabelText('Global.Okay')
    act(() => {
      fireEvent.press(okayButton)
    })
    expect(tree.queryByTestId(testIdWithKey('ForgotPINModalDescription'))).toBeNull()
  })

  test('Vesion number is displayed', async () => {
    const main = new MainContainer(container.createChildContainer()).init()
    const tree = render(
      <ContainerProvider value={main}>
        <StoreProvider
          initialState={{
            ...defaultState,
          }}
        >
          <AuthContext.Provider value={authContext}>
            <PINEnter setAuthenticated={jest.fn()} />
          </AuthContext.Provider>
        </StoreProvider>
      </ContainerProvider>
    )
    const versionText = await tree.getByTestId(testIdWithKey('Version'))
    expect(versionText).not.toBeNull()
  })

  test('keyboard dismiss is called when pin input is filled', async () => {
    jest.spyOn(Keyboard, 'dismiss').mockImplementation(() => {})

    const main = new MainContainer(container.createChildContainer()).init()
    const tree = render(
      <ContainerProvider value={main}>
        <StoreProvider
          initialState={{
            ...defaultState,
          }}
        >
          <AuthContext.Provider value={authContext}>
            <PINEnter setAuthenticated={jest.fn()} />
          </AuthContext.Provider>
        </StoreProvider>
      </ContainerProvider>
    )
    const pinInput = tree.getByTestId(testIdWithKey('EnterPIN'))
    await act(async () => {
      fireEvent.changeText(pinInput, '123456') // minpinlength is 6
    })
    expect(Keyboard.dismiss).toHaveBeenCalled()
  })

  test('pin is submitted when pin input is filled', async () => {
    const setAuthenticatedMock = jest.fn()
    const mockAuthContext = {
      ...authContext,
      checkWalletPIN: jest.fn().mockResolvedValue(true),
      setAuthenticated: setAuthenticatedMock,
    }
    const main = new MainContainer(container.createChildContainer()).init()
    const tree = render(
      <ContainerProvider value={main}>
        <StoreProvider
          initialState={{
            ...defaultState,
          }}
        >
          <AuthContext.Provider value={mockAuthContext}>
            <PINEnter setAuthenticated={mockAuthContext.setAuthenticated} />
          </AuthContext.Provider>
        </StoreProvider>
      </ContainerProvider>
    )
    const pinInput = tree.getByTestId(testIdWithKey('EnterPIN'))
    await act(async () => {
      fireEvent.changeText(pinInput, '123456') // minpinlength is 6
    })
    expect(setAuthenticatedMock).toHaveBeenCalled()
  })

  test('Keyboard enter button submits PIN', async () => {
    const setAuthenticatedMock = jest.fn()
    const mockAuthContext = {
      ...authContext,
      checkWalletPIN: jest.fn().mockResolvedValue(true),
      setAuthenticated: setAuthenticatedMock,
    }
    const main = new MainContainer(container.createChildContainer()).init()
    const tree = render(
      <ContainerProvider value={main}>
        <StoreProvider
          initialState={{
            ...defaultState,
          }}
        >
          <AuthContext.Provider value={mockAuthContext}>
            <PINEnter setAuthenticated={mockAuthContext.setAuthenticated} />
          </AuthContext.Provider>
        </StoreProvider>
      </ContainerProvider>
    )
    const pinInput = tree.getByTestId(testIdWithKey('EnterPIN'))
    await act(async () => {
      fireEvent.changeText(pinInput, '12345') // only 5 characters so the pin isnt autosubmitted
    })

    await act(async () => {
      fireEvent(pinInput, 'submitEditing')
    })
    await waitFor(
      () => {
        // look for inline error message
        expect(tree.queryByText('PINCreate.PINTooShort')).not.toBeNull()
      },
      { timeout: 1000 }
    )
  })
})
