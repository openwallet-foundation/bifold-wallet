import { act, render, waitFor } from '@testing-library/react-native'
import React from 'react'

import { LocalStorageKeys } from '../../App/constants'
import { AuthContext } from '../../App/contexts/auth'
import { ConfigurationContext } from '../../App/contexts/configuration'
import { StoreProvider, defaultState } from '../../App/contexts/store'
import Splash from '../../App/screens/Splash'
import AsyncStorage from '../../__mocks__/@react-native-async-storage/async-storage'
import authContext from '../contexts/auth'
import configurationContext from '../contexts/configuration'

jest.mock('@hyperledger/aries-askar-react-native', () => ({}))
jest.mock('@hyperledger/anoncreds-react-native', () => ({}))
jest.mock('@hyperledger/indy-vdr-react-native', () => ({}))
jest.mock('react-native-fs', () => ({}))
const mockedDispatch = jest.fn()
jest.mock('@react-navigation/core', () => {
  const actualNav = jest.requireActual('@react-navigation/core')
  return {
    ...actualNav,
    useNavigation: () => ({
      dispatch: mockedDispatch,
    }),
  }
})

describe('Splash Screen', () => {
  beforeAll(()=>{
    jest.useFakeTimers()
  })
  afterAll(()=>{
    jest.useRealTimers()
  })
  test('Renders default correctly', async () => {
    const tree = render(
      <ConfigurationContext.Provider value={configurationContext}>
        <AuthContext.Provider value={authContext}>
          <Splash />
        </AuthContext.Provider>
      </ConfigurationContext.Provider>
    )
    await act(()=>{ jest.runAllTimers() })
    expect(tree).toMatchSnapshot()
  })

  test('Starts onboarding correctly', async () => {
    AsyncStorage.getItem = jest.fn().mockImplementation((key: string) => {
      switch (key) {
        case LocalStorageKeys.LoginAttempts:
          return JSON.stringify({
            servedPenalty: true,
            loginAttempts: 0,
          })
        case LocalStorageKeys.Preferences:
          return JSON.stringify({
            useBiometry: false,
            biometryPreferencesUpdated: false,
            developerModeEnabled: false,
            useVerifierCapability: false,
            useConnectionInviterCapability: false,
            useDevVerifierTemplates: false,
            enableWalletNaming: true,
            walletName: 'My Wallet 1234',
          })
        case LocalStorageKeys.Migration:
          return JSON.stringify({
            didMigrateToAskar: true,
          })
        case LocalStorageKeys.Onboarding:
          return JSON.stringify({
            didCompleteTutorial: false,
            didAgreeToTerms: false,
            didCreatePIN: false,
            didConsiderBiometry: false,
            didNameWallet: false,
          })
        case LocalStorageKeys.Tours:
          return JSON.stringify({
            seenToursPrompt: false,
            enableTours: false,
            seenHomeTour: false,
            seenCredentialsTour: false,
            seenCredentialOfferTour: false,
            seenProofRequestTour: false,
          })
      }
    })
    await waitFor(() => {
      render(
        <StoreProvider
          initialState={{
            ...defaultState,
          }}
        >
          <ConfigurationContext.Provider value={configurationContext}>
            <AuthContext.Provider value={authContext}>
              <Splash />
            </AuthContext.Provider>
          </ConfigurationContext.Provider>
        </StoreProvider>
      )
    })
    await act(()=>{ jest.runAllTimers() })
    expect(mockedDispatch).toHaveBeenCalled()
  })
})
