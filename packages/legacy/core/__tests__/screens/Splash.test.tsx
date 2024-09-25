import { useNavigation } from '@react-navigation/native'
import { act, render, waitFor } from '@testing-library/react-native'
import React from 'react'

import { LocalStorageKeys } from '../../App/constants'
import { AuthContext } from '../../App/contexts/auth'
import { testDefaultState } from '../contexts/store'
import { StoreProvider } from '../../App/contexts/store'
import Splash from '../../App/screens/Splash'
import AsyncStorage from '@react-native-async-storage/async-storage'
import authContext from '../contexts/auth'
import { loadLoginAttempt } from '../../App/services/keychain'
import { BasicAppContext } from '../helpers/app'

jest.mock('../../App/services/keychain', () => ({
  loadLoginAttempt: jest.fn(),
}))

describe('Splash Screen', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })
  beforeAll(() => {
    jest.useFakeTimers()
  })
  afterEach(() => {
    jest.clearAllTimers()
  })
  afterAll(() => {
    jest.useRealTimers()
  })
  test('Renders default correctly', async () => {
    const tree = render(
      <BasicAppContext>
        <AuthContext.Provider value={authContext}>
          <Splash />
        </AuthContext.Provider>
      </BasicAppContext>
    )
    await act(() => {
      jest.runAllTimers()
    })
    expect(tree).toMatchSnapshot()
  })

  test('Starts onboarding correctly', async () => {
    const navigation = useNavigation()
    // @ts-expect-error this function will be replaced with a mock which does have this method
    loadLoginAttempt.mockReturnValue({ servedPenalty: true, loginAttempts: 0 })

    AsyncStorage.getItem = jest.fn().mockImplementation((key: string) => {
      switch (key) {
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
            ...testDefaultState,
          }}
        >
          <BasicAppContext>
            <AuthContext.Provider value={authContext}>
              <Splash />
            </AuthContext.Provider>
          </BasicAppContext>
        </StoreProvider>
      )
    })

    await act(() => {
      jest.runAllTimers()
    })

    expect(navigation.dispatch).toHaveBeenCalledTimes(1)
  })
})
