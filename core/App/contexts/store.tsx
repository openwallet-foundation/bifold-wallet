import React, { createContext, Dispatch, useContext, useReducer } from 'react'

import { State } from '../types/state'

import _defaultReducer, { ReducerAction } from './reducers/store'

type Reducer = <S extends State>(state: S, action: ReducerAction) => S

interface StoreProviderProps {
  initialState?: State
  reducer?: Reducer
}

const initialState: State = {
  onboarding: {
    didAgreeToTerms: false,
    didCompleteTutorial: false,
    didCreatePIN: false,
    didConsiderBiometry: false,
  },
  authentication: {
    didAuthenticate: false,
  },
  loginAttempt: {
    loginAttempts: 0,
    servedPenalty: true,
  },
  lockout: {
    displayNotification: false,
  },
  privacy: {
    didShowCameraDisclosure: false,
  },
  preferences: {
    useBiometry: false,
  },
  credential: {
    revoked: new Set(),
    revokedMessageDismissed: new Set(),
  },
  error: null,
  loading: false,
}

export const createInitialStateFactory = (): State => {
  return initialState
}

export const StoreContext = createContext<[State, Dispatch<ReducerAction>]>([
  initialState,
  () => {
    return
  },
])

export const mergeReducers = (a: Reducer, b: Reducer): Reducer => {
  return <S extends State>(state: S, action: ReducerAction): S => {
    return a(b(state, action), action)
  }
}

export const defaultReducer = _defaultReducer

export const StoreProvider: React.FC<StoreProviderProps> = ({ children, initialState, reducer }) => {
  const initialStateValues: State = initialState ?? createInitialStateFactory()
  const _reducer = reducer ?? defaultReducer
  const [state, dispatch] = useReducer(_reducer, initialStateValues)

  return <StoreContext.Provider value={[state, dispatch]}>{children}</StoreContext.Provider>
}

export const useStore = <T extends State>(): [T, Dispatch<ReducerAction>] => {
  const context = useContext(StoreContext)

  return context as unknown as [T, Dispatch<ReducerAction>]
}
