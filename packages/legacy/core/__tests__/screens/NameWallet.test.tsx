import { render } from '@testing-library/react-native'
import React from 'react'

import NameWallet from '../../App/screens/NameWallet'
import { testIdWithKey } from '../../App/utils/testable'

jest.mock('@react-navigation/core', () => {
  return require('../../__mocks__/custom/@react-navigation/core')
})
jest.mock('@react-navigation/native', () => {
  return require('../../__mocks__/custom/@react-navigation/native')
})

describe('NameWallet Screen', () => {
  test('LimitedInput and continue button are present', async () => {
    const tree = render(<NameWallet />)

    const WalletNameInput = await tree.getByTestId(testIdWithKey('NameInput'))

    const ContinueButton = await tree.getByTestId(testIdWithKey('Continue'))

    expect(WalletNameInput).not.toBeNull()
    expect(ContinueButton).not.toBeNull()
  })
})
