import React, { createContext, Dispatch, useContext, useReducer } from 'react'

import {
  Authentication,
  Credential,
  Lockout,
  LoginAttempt,
  Onboarding,
  Preferences,
  Privacy,
  State,
} from '../types/state'

import _defaultReducer, { ReducerAction } from './reducers/store'

import { BifoldError } from 'types/error'
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export class DefaultBiFoldState implements State {
  public onboarding: Onboarding = {
    didAgreeToTerms: false,
    didCompleteTutorial: false,
    didCreatePIN: false,
    didConsiderBiometry: false,
  }
  public authentication: Authentication = {
    didAuthenticate: false,
  }
  public privacy: Privacy = {
    didShowCameraDisclosure: false,
  }
  public lockout: Lockout = {
    displayNotification: false,
  }
  public loginAttempt: LoginAttempt = {
    loginAttempts: 0,
    servedPenalty: true,
  }
  public preferences: Preferences = {
    useBiometry: false,
  }
  public credential: Credential = {
    revoked: new Set(),
    revokedMessageDismissed: new Set(),
  }
  public error: BifoldError | null = null
  public loading = false
}

export const createInitialStateFactory = (): DefaultBiFoldState => {
  return new DefaultBiFoldState()
}
const initialState = createInitialStateFactory()

export const StoreContext = createContext<[DefaultBiFoldState, Dispatch<ReducerAction>]>([
  initialState,
  () => {
    return
  },
])

interface StoreProviderProps {
  initialState?: State
  reducer?: (state: State, action: ReducerAction) => State
}

type ReduceType = (state: State, action: ReducerAction) => State

export const mergeReducers = (reducer1: ReduceType, reducer2: ReduceType): ReduceType => {
  console.log(`Creating a merged reducer`)
  return (state: State, action: ReducerAction): State => {
    return reducer1(reducer2(state, action), action)
  }
}

export const defaultReducer = _defaultReducer

export const StoreProvider: React.FC<StoreProviderProps> = ({ children, initialState, reducer }) => {
  const initialStateValues: State = initialState ?? createInitialStateFactory()
  const _reducer = reducer !== undefined ? reducer : defaultReducer
  const [state, dispatch] = useReducer(_reducer, initialStateValues)
  console.log(`Creating Provider with State: ${JSON.stringify(initialStateValues)}`)
  return <StoreContext.Provider value={[state, dispatch]}>{children}</StoreContext.Provider>
}
export const useStore = <T extends State>(): [T, Dispatch<ReducerAction>] => {
  const context = useContext(StoreContext)
  //console.log(`UseStore Context: ${JSON.stringify(context)}`)
  return context as unknown as [T, Dispatch<ReducerAction>]
}
