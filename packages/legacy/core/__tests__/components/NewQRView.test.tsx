import { useConnections } from '@aries-framework/react-hooks'
import { render } from '@testing-library/react-native'
import React from 'react'

import NewQRView from '../../App/components/misc/NewQRView'
import { ConfigurationContext } from '../../App/contexts/configuration'
import { StoreProvider, defaultState } from '../../App/contexts/store'
import configurationContext from '../contexts/configuration'

jest.mock('@react-navigation/core', () => {
  return require('../../__mocks__/custom/@react-navigation/core')
})
jest.mock('@react-navigation/native', () => {
  return require('../../__mocks__/custom/@react-navigation/native')
})

describe('NewQRView Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // @ts-ignore
    useConnections.mockReturnValue({ records: [] })
  })

  test('Renders correctly on first tab', async () => {
    const tree = render(
      <ConfigurationContext.Provider value={configurationContext}>
        <NewQRView defaultToConnect={false} handleCodeScan={() => Promise.resolve()} />
      </ConfigurationContext.Provider>
    )

    expect(tree).toMatchSnapshot()
  })

  test('Renders correctly on second tab', async () => {
    const tree = render(
      <StoreProvider
        initialState={{
          ...defaultState,
          preferences: {
            developerModeEnabled: false,
            biometryPreferencesUpdated: false,
            useBiometry: false,
            useVerifierCapability: false,
            useConnectionInviterCapability: false,
            useDevVerifierTemplates: false,
            walletName: 'My Wallet - 1234',
          },
        }}
      >
        <ConfigurationContext.Provider value={configurationContext}>
          <NewQRView defaultToConnect={true} handleCodeScan={() => Promise.resolve()} />
        </ConfigurationContext.Provider>
      </StoreProvider>
    )

    expect(tree).toMatchSnapshot()
  })
})
