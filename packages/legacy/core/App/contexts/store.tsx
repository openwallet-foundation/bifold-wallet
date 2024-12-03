import React, { createContext, Dispatch, useContext, useReducer } from 'react'

import { State } from '../types/state'
import { generateRandomWalletName } from '../utils/helpers'

import _defaultReducer, { ReducerAction } from './reducers/store'
import { defaultAutoLockTime } from '../constants'

type Reducer = <S extends State>(state: S, action: ReducerAction<any>) => S

interface StoreProviderProps extends React.PropsWithChildren {
  initialState?: State
  reducer?: Reducer
}

export const defaultState: State = {
  onboarding: {
    didSeePreface: false,
    didAgreeToTerms: false,
    didCompleteTutorial: false,
    didCreatePIN: false,
    didConsiderPushNotifications: false,
    didConsiderBiometry: false,
    didNameWallet: false,
    onboardingVersion: 0,
    didCompleteOnboarding: false,
    postAuthScreens: [],
  },
  authentication: {
    didAuthenticate: false,
  },
  // NOTE: from Credo 0.4.0 on we use Aries Askar. New wallets will be created with Askar from the start
  // which we will know when we create the pin while using askar as a dependency.
  migration: {
    didMigrateToAskar: false,
  },
  loginAttempt: {
    loginAttempts: 0,
    servedPenalty: true,
  },
  lockout: {
    displayNotification: false,
  },
  preferences: {
    developerModeEnabled: false,
    biometryPreferencesUpdated: false,
    useBiometry: false,
    usePushNotifications: false,
    useVerifierCapability: false,
    useConnectionInviterCapability: false,
    useDevVerifierTemplates: false,
    acceptDevCredentials: false,
    useDataRetention: true,
    enableWalletNaming: false,
    walletName: generateRandomWalletName(),
    preventAutoLock: false,
    enableShareableLink: false,
    alternateContactNames: {},
    autoLockTime: defaultAutoLockTime, // default wallets lockout time to 5 minutes
  },
  tours: {
    seenToursPrompt: false,
    enableTours: true,
    seenHomeTour: false,
    seenCredentialsTour: false,
    seenCredentialOfferTour: false,
    seenProofRequestTour: false,
  },
  stateLoaded: false,
}

export const StoreContext = createContext<[State, Dispatch<ReducerAction<any>>]>([
  defaultState,
  () => {
    return
  },
])

export const mergeReducers = (a: Reducer, b: Reducer): Reducer => {
  return <S extends State>(state: S, action: ReducerAction<any>): S => {
    return a(b(state, action), action)
  }
}

export const defaultReducer = _defaultReducer

export const StoreProvider: React.FC<StoreProviderProps> = ({ children, initialState, reducer }) => {
  const _reducer = reducer ?? defaultReducer
  const _state = initialState ?? defaultState
  const [state, dispatch] = useReducer(_reducer, _state)

  return <StoreContext.Provider value={[state, dispatch]}>{children}</StoreContext.Provider>
}

export const useStore = <S extends State>(): [S, Dispatch<ReducerAction<any>>] => {
  const context = useContext(StoreContext)

  return context as unknown as [S, Dispatch<ReducerAction<any>>]
}
