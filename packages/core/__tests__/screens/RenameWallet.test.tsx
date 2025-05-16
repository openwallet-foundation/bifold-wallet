import { render } from '@testing-library/react-native'
import React from 'react'

import { StoreProvider } from '../../src'
import { testIdWithKey } from '../../src/utils/testable'
import { testDefaultState } from '../contexts/store'
import { BasicAppContext } from '../helpers/app'
import RenameWallet from '../../src/screens/RenameWallet'

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

describe('RenameWallet Screen', () => {
  test('Check non-onboarding rendering', async () => {
    const tree = render(
      <StoreProvider initialState={testDefaultState}>
        <BasicAppContext>
          <RenameWallet/>
        </BasicAppContext>
      </StoreProvider>
    )

    const SaveButton = await tree.getByTestId(testIdWithKey('Save'))
    const CancelButton = await tree.getByTestId(testIdWithKey('Cancel'))

    expect(SaveButton).not.toBeNull()
    expect(CancelButton).not.toBeNull()
    expect(tree).toMatchSnapshot()
  })
})
