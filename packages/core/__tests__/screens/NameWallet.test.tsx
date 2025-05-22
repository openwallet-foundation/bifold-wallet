import { render } from '@testing-library/react-native'
import React from 'react'

import { StoreProvider } from '../../src'
import NameWallet from '../../src/screens/NameWallet'
import { testIdWithKey } from '../../src/utils/testable'
import { testDefaultState } from '../contexts/store'
import { BasicAppContext } from '../helpers/app'

jest.mock('react-native-permissions', () => require('react-native-permissions/mock'))
jest.mock('react-native-vision-camera', () => {
  return require('../../__mocks__/custom/react-native-camera')
})

jest.mock('react-native-device-info', () => {
  return {
    getVersion: () => 1,
    getBuildNumber: () => 1,
  }
})

describe('NameWallet Screen', () => {
  test('LimitedInput and continue button are present', async () => {
    const tree = render(
      <StoreProvider initialState={testDefaultState}>
        <BasicAppContext>
          <NameWallet />
        </BasicAppContext>
      </StoreProvider>
    )

    const WalletNameInput = await tree.getByTestId(testIdWithKey('NameInput'))
    const ContinueButton = await tree.getByTestId(testIdWithKey('Continue'))

    expect(WalletNameInput).not.toBeNull()
    expect(ContinueButton).not.toBeNull()
    expect(tree).toMatchSnapshot()
  })
})
