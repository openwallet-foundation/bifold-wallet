import { useNavigation } from '@react-navigation/core'
import { render } from '@testing-library/react-native'
import React from 'react'

import Settings from '../../App/screens/Settings'
import configurationContext from '../contexts/configuration'
import { ConfigurationContext } from '../../App/contexts/configuration'
import { testIdWithKey } from '../../App/utils/testable'
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

describe('Settings Screen', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('Renders correctly', async () => {
    const tree = render(
      <ConfigurationContext.Provider value={configurationContext}>
        <Settings navigation={useNavigation()} route={{} as any} />
      </ConfigurationContext.Provider>
    )
    expect(tree).toMatchSnapshot()
  })

  test('If developer mode is enabled, developer mode button is shown', async () => {
    const customState = {
      ...testDefaultState,
      preferences: {
        ...testDefaultState.preferences,
        developerModeEnabled: true
      }
    } 
    const tree = render(
      <StoreContext.Provider value={[customState, () => { return }]}>
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
        useVerifierCapability: true
      }
    }    
    const tree = render(
      <StoreContext.Provider value={[customState, () => { return }]}>
        <ConfigurationContext.Provider value={configurationContext}>
          <Settings navigation={useNavigation()} route={{} as any} />
        </ConfigurationContext.Provider>
      </StoreContext.Provider>
    )
    const proofButton = tree.getByTestId(testIdWithKey('ProofRequests'))
    expect(proofButton).not.toBeNull()
  })
})
