import { render } from '@testing-library/react-native'
import React from 'react'

import NameWallet from '../../App/screens/NameWallet'
import { testIdWithKey } from '../../App/utils/testable'
import configurationContext from '../contexts/configuration'
import { ConfigurationContext } from '../../App/contexts/configuration'
import { StoreContext, StoreProvider } from '../../App'
import { testDefaultState } from '../contexts/store'

jest.mock('@react-navigation/core', () => {
  return require('../../__mocks__/custom/@react-navigation/core')
})
jest.mock('@react-navigation/native', () => {
  return require('../../__mocks__/custom/@react-navigation/native')
})
jest.mock('react-native-fs', () => ({}))
jest.mock('@hyperledger/anoncreds-react-native', () => ({}))
jest.mock('@hyperledger/aries-askar-react-native', () => ({}))
jest.mock('@hyperledger/indy-vdr-react-native', () => ({}))
jest.mock('react-native-permissions', () => require('react-native-permissions/mock'))

jest.mock('react-native-device-info', () => {
  return {
    getVersion: () => 1,
    getBuildNumber: () => 1,
  }
})

describe('NameWallet Screen', () => {
  test('LimitedInput and continue button are present', async () => {
    const tree = render(<NameWallet />)

    const WalletNameInput = await tree.getByTestId(testIdWithKey('NameInput'))

    const ContinueButton = await tree.getByTestId(testIdWithKey('Continue'))

    expect(WalletNameInput).not.toBeNull()
    expect(ContinueButton).not.toBeNull()
  })

  test('Check non-onboarding rendering', async () => {
    const customState = {
      ...testDefaultState,
      onboarding: {
        didAgreeToTerms: true,
        didCompleteTutorial: true,
        didCreatePIN: true,
        didConsiderBiometry: true,
        didNameWallet: true,
      },
    } 
    const tree = render(
      <StoreContext.Provider value={[customState, () => { return }]}>
        <ConfigurationContext.Provider value={configurationContext}>
          <NameWallet />
        </ConfigurationContext.Provider>
      </StoreContext.Provider>
    )


    const SaveButton = await tree.getByTestId(testIdWithKey('Save'))
    const CancelButton = await tree.getByTestId(testIdWithKey('Cancel'))

    expect(SaveButton).not.toBeNull()
    expect(CancelButton).not.toBeNull()
  })
})
