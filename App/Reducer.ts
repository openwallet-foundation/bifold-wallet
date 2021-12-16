import AsyncStorage from '@react-native-async-storage/async-storage'

import { LocalStorageKeys } from './constants'
import { State } from './types/state'

export enum DispatchAction {
  SetTutorialCompletionStatus = 'SET_DID_COMPLETE_TUTORIAL',
  SetDidAgreeToTerms = 'SET_DID_AGREE_TO_TERMS',
  SetDidCreatePIN = 'SET_DID_CREATE_PIN',
  SetOnboardingState = 'SET_ONBOARDING_STATE',
  SetError = 'SET_ERROR',
}

export interface ReducerAction {
  payload: Array<any>
  type: DispatchAction
}

const Reducer = (state: State, action: ReducerAction): State => {
  switch (action.type) {
    case DispatchAction.SetOnboardingState:
      return {
        ...state,
        onboarding: action.payload.pop(),
      }

    case DispatchAction.SetTutorialCompletionStatus: {
      const myState = {
        ...state,
        onboarding: {
          ...state.onboarding,
          ...action.payload.pop(),
        },
      }

      AsyncStorage.setItem(LocalStorageKeys.Onboarding, JSON.stringify(myState.onboarding))

      return myState
    }
    case DispatchAction.SetDidAgreeToTerms: {
      const myState = {
        ...state,
        onboarding: {
          ...state.onboarding,
          ...action.payload.pop(),
        },
      }

      AsyncStorage.setItem(LocalStorageKeys.Onboarding, JSON.stringify(myState.onboarding))

      return myState
    }
    case DispatchAction.SetDidCreatePIN: {
      const myState = {
        ...state,
        onboarding: {
          ...state.onboarding,
          ...action.payload.pop(),
        },
      }

      AsyncStorage.setItem(LocalStorageKeys.Onboarding, JSON.stringify(myState.onboarding))

      return myState
    }
    case DispatchAction.SetError:
      return {
        ...state,
        error: { ...action.payload.pop() },
      }
    default:
      return state
  }
}

export default Reducer
