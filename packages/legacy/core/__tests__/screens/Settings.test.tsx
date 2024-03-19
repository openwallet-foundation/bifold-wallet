import { useNavigation } from '@react-navigation/core'
import { render } from '@testing-library/react-native'
import React from 'react'

import { StoreContext } from '../../App'
import { ConfigurationContext } from '../../App/contexts/configuration'
import Settings from '../../App/screens/Settings'
import { testIdWithKey } from '../../App/utils/testable'
import configurationContext from '../contexts/configuration'
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
jest.mock('react-native-vision-camera', () => {
  return require('../../__mocks__/custom/react-native-camera')
})

jest.mock('react-native-device-info', () => {
  return {
    getVersion: () => 1,
    getBuildNumber: () => 1,
  }
})

describe('Settings Screen', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('Renders correctly', async () => {
    const customState = {
      ...testDefaultState,
      preferences: {
        ...testDefaultState.preferences,
        developerModeEnabled: true,
        walletName: 'My Wallet',
      },
    }

    const tree = render(
      <StoreContext.Provider
        value={[
          customState,
          () => {
            return
          },
        ]}
      >
        <ConfigurationContext.Provider value={configurationContext}>
          <Settings navigation={useNavigation()} route={{} as any} />
        </ConfigurationContext.Provider>
      </StoreContext.Provider>
    )
    expect(tree).toMatchSnapshot()
  })

  test('Renders correctly with wallet naming', async () => {
    const customState = {
      ...testDefaultState,
      preferences: {
        ...testDefaultState.preferences,
        developerModeEnabled: true,
        useConnectionInviterCapability: true,
        walletName: 'Wallet123',
      },
    }

    const tree = render(
      <StoreContext.Provider
        value={[
          customState,
          () => {
            return
          },
        ]}
      >
        <ConfigurationContext.Provider value={configurationContext}>
          <Settings navigation={useNavigation()} route={{} as any} />
        </ConfigurationContext.Provider>
      </StoreContext.Provider>
    )

    const walletName = tree.getByText('Wallet123')
    const editButton = tree.getByTestId(testIdWithKey('EditWalletName'))

    expect(editButton).not.toBeNull()
    expect(walletName).not.toBeNull()
  })

  test('If developer mode is enabled, developer mode button is shown', async () => {
    const customState = {
      ...testDefaultState,
      preferences: {
        ...testDefaultState.preferences,
        developerModeEnabled: true,
        walletName: 'My Wallet',
      },
    }
    const tree = render(
      <StoreContext.Provider
        value={[
          customState,
          () => {
            return
          },
        ]}
      >
        <ConfigurationContext.Provider value={configurationContext}>
          <Settings navigation={useNavigation()} route={{} as any} />
        </ConfigurationContext.Provider>
      </StoreContext.Provider>
    )

    const developerModeButton = tree.getByTestId(testIdWithKey('DeveloperOptions'))
    expect(developerModeButton).not.toBeNull()
  })

  test('If mobile verifier is enabled, verifier options are shown', async () => {
    const customState = {
      ...testDefaultState,
      preferences: {
        ...testDefaultState.preferences,
        useVerifierCapability: true,
        walletName: 'My Wallet',
      },
    }
    const tree = render(
      <StoreContext.Provider
        value={[
          customState,
          () => {
            return
          },
        ]}
      >
        <ConfigurationContext.Provider value={configurationContext}>
          <Settings navigation={useNavigation()} route={{} as any} />
        </ConfigurationContext.Provider>
      </StoreContext.Provider>
    )
    const proofButton = tree.getByTestId(testIdWithKey('ProofRequests'))
    expect(proofButton).not.toBeNull()
  })
})
