import { render, fireEvent } from '@testing-library/react-native'
import React from 'react'

import { AuthContext } from '../../App/contexts/auth'
import UseBiometry from '../../App/screens/UseBiometry'
import { testIdWithKey } from '../../App/utils/testable'

jest.mock('@react-navigation/core', () => {
  return require('../../__mocks__/custom/@react-navigation/core')
})
jest.mock('@react-navigation/native', () => {
  return require('../../__mocks__/custom/@react-navigation/native')
})

describe('UseBiometry Screen', () => {
  test('Renders correctly', () => {
    const tree = render(
      <AuthContext.Provider
        value={{
          checkPIN: jest.fn(),
          convertToUseBiometrics: jest.fn(),
          getWalletCredentials: jest.fn(),
          setPIN: jest.fn(),
        }}
      >
        <UseBiometry />
      </AuthContext.Provider>
    )

    expect(tree).toMatchSnapshot()
  })

  test('Toggles use biometrics ok', async () => {
    const convertToUseBiometrics = jest.fn()
    const tree = render(
      <AuthContext.Provider
        value={{
          checkPIN: jest.fn(),
          convertToUseBiometrics,
          getWalletCredentials: jest.fn(),
          setPIN: jest.fn(),
        }}
      >
        <UseBiometry />
      </AuthContext.Provider>
    )

    const useBiometryToggle = await tree.getByTestId(testIdWithKey('ToggleBiometrics'))
    fireEvent(useBiometryToggle, 'valueChange', true)

    const continueButton = await tree.getByTestId(testIdWithKey('Continue'))
    fireEvent(continueButton, 'press')

    expect(useBiometryToggle).not.toBeNull()
    expect(continueButton).not.toBeNull()
    expect(convertToUseBiometrics).toBeCalledTimes(1)
    expect(tree).toMatchSnapshot()
  })
})
