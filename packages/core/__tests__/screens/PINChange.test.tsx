import { render, fireEvent, act } from '@testing-library/react-native'
import React from 'react'

import { StoreProvider, defaultState } from '../../src/contexts/store'
import PINChange from '../../src/screens/PINChange'
import { testIdWithKey } from '../../src/utils/testable'
import { MainContainer } from '../../src/container-impl'
import { container } from 'tsyringe'
import { ContainerProvider } from '../../src/container-api'
import * as authModule from '../../src/contexts/auth'

const mockNavigate = jest.fn()
const mockNavigation = {
  navigate: mockNavigate,
} as any
const mockCheckWalletPIN = jest.fn()
const mockReKeyWallet = jest.fn()

const useAuthSpy = jest.spyOn(authModule, 'useAuth')

describe('PINChange Screen', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Set up the spy to return our mock functions
    useAuthSpy.mockReturnValue({
      checkWalletPIN: mockCheckWalletPIN,
      rekeyWallet: mockReKeyWallet,
    } as any)
  })

  test('PIN change renders correctly', async () => {
    const main = new MainContainer(container.createChildContainer()).init()
    const route = {} as any
    const tree = render(
      <ContainerProvider value={main}>
        <StoreProvider
          initialState={{
            ...defaultState,
          }}
        >
          <PINChange route={route} navigation={mockNavigation} />
        </StoreProvider>
      </ContainerProvider>
    )

    expect(tree).toMatchSnapshot()
    const oldPinInput = tree.getByTestId(testIdWithKey('EnterOldPIN'))
    const newPinInput1 = tree.getByTestId(testIdWithKey('EnterPIN'))
    const newPinInput2 = tree.getByTestId(testIdWithKey('ReenterPIN'))
    const submitButton = tree.getByTestId(testIdWithKey('ChangePIN'))

    expect(oldPinInput).not.toBe(null)
    expect(newPinInput1).not.toBe(null)
    expect(newPinInput2).not.toBe(null)
    expect(submitButton).not.toBe(null)
  })

  test('Enter button submits PIN change', async () => {
    mockCheckWalletPIN.mockResolvedValue(true)
    mockReKeyWallet.mockResolvedValue(true)

    const main = new MainContainer(container.createChildContainer()).init()
    const route = {} as any
    const tree = render(
      <ContainerProvider value={main}>
        <StoreProvider
          initialState={{
            ...defaultState,
          }}
        >
          <PINChange route={route} navigation={mockNavigation} />
        </StoreProvider>
      </ContainerProvider>
    )

    const oldPinInput = tree.getByTestId(testIdWithKey('EnterOldPIN'))
    const newPinInput1 = tree.getByTestId(testIdWithKey('EnterPIN'))
    const newPinInput2 = tree.getByTestId(testIdWithKey('ReenterPIN'))

    await act(async () => {
      fireEvent.changeText(oldPinInput, '123456')
      fireEvent.changeText(newPinInput1, '654321')
      fireEvent.changeText(newPinInput2, '654321')
    })

    await act(async () => {
      fireEvent(newPinInput2, 'submitEditing')
    })

    expect(mockCheckWalletPIN).toHaveBeenCalledWith('123456')

    expect(mockReKeyWallet).toHaveBeenCalledWith(expect.anything(), '123456', '654321', expect.any(Boolean))
  })

  test('Successful PIN change shows success modal', async () => {
    mockCheckWalletPIN.mockResolvedValue(true)
    mockReKeyWallet.mockResolvedValue(true)

    const main = new MainContainer(container.createChildContainer()).init()
    const route = {} as any
    const tree = render(
      <ContainerProvider value={main}>
        <StoreProvider
          initialState={{
            ...defaultState,
          }}
        >
          <PINChange route={route} navigation={mockNavigation} />
        </StoreProvider>
      </ContainerProvider>
    )

    const oldPinInput = tree.getByTestId(testIdWithKey('EnterOldPIN'))
    const newPinInput1 = tree.getByTestId(testIdWithKey('EnterPIN'))
    const newPinInput2 = tree.getByTestId(testIdWithKey('ReenterPIN'))
    const submitButton = tree.getByTestId(testIdWithKey('ChangePIN'))

    await act(async () => {
      fireEvent.changeText(oldPinInput, '123456')
      fireEvent.changeText(newPinInput1, '654321')
      fireEvent.changeText(newPinInput2, '654321')
    })

    await act(async () => {
      fireEvent.press(submitButton)
    })

    expect(mockCheckWalletPIN).toHaveBeenCalledWith('123456')

    expect(mockReKeyWallet).toHaveBeenCalledWith(expect.anything(), '123456', '654321', expect.any(Boolean))

    const successModal = tree.getByText('PINChange.PinChangeSuccessTitle')
    expect(successModal).not.toBeNull()
  })
})
