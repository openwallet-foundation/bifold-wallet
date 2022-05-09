import React, { createContext, Dispatch, useContext, useReducer } from 'react'

import { State } from '../types/state'

import reducer, { ReducerAction } from './reducers/store'

export interface StoreProviderProps {
  children: any
}

const initialState: State = {
  onboarding: {
    didAgreeToTerms: false,
    didCompleteTutorial: false,
    didCreatePIN: false,
  },
  credential: {
    revoked: new Set(),
    revokedMessageDismissed: new Set(),
  },
  error: null,
}

export const StoreContext = createContext<[State, Dispatch<ReducerAction>]>([
  initialState,
  () => {
    return
  },
])

export const StoreProvider: React.FC<StoreProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState)
  return <StoreContext.Provider value={[state, dispatch]}>{children}</StoreContext.Provider>
}

export const useStore = () => useContext(StoreContext)
