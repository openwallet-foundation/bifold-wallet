import AsyncStorage from '@react-native-async-storage/async-storage'

import { LocalStorageKeys } from '../../constants'
import {
  Preferences as PreferencesState,
  Onboarding as OnboardingState,
  Authentication as AuthenticationState,
  Lockout as LockoutState,
  LoginAttempt as LoginAttemptState,
  State,
} from '../../types/state'

enum OnboardingDispatchAction {
  ONBOARDING_UPDATED = 'onboarding/onboardingStateLoaded',
  DID_COMPLETE_TUTORIAL = 'onboarding/didCompleteTutorial',
  DID_AGREE_TO_TERMS = 'onboarding/didAgreeToTerms',
  DID_CREATE_PIN = 'onboarding/didCreatePIN',
}

enum ErrorDispatchAction {
  ERROR_ADDED = 'error/errorAdded',
  ERROR_REMOVED = 'error/errorRemoved',
}

enum LockoutDispatchAction {
  LOCKOUT_UPDATED = 'lockout/lockoutUpdated',
}

enum LoginAttemptDispatchAction {
  ATTEMPT_UPDATED = 'loginAttempt/loginAttemptUpdated',
}

enum PreferencesDispatchAction {
  ENABLE_DEVELOPER_MODE = 'preferences/enableDeveloperMode',
  USE_BIOMETRY = 'preferences/useBiometry',
  BIOMETRY_PREFERENCES_UPDATED = 'preferences/biometryPreferencesUpdated',
  PREFERENCES_UPDATED = 'preferences/preferencesStateLoaded',
}

enum AuthenticationDispatchAction {
  DID_AUTHENTICATE = 'authentication/didAuthenticate',
}

enum DeepLinkDispatchAction {
  ACTIVE_DEEP_LINK = 'deepLink/activeDeepLink',
}

export type DispatchAction =
  | OnboardingDispatchAction
  | ErrorDispatchAction
  | LoginAttemptDispatchAction
  | LockoutDispatchAction
  | PreferencesDispatchAction
  | AuthenticationDispatchAction
  | DeepLinkDispatchAction

export const DispatchAction = {
  ...OnboardingDispatchAction,
  ...ErrorDispatchAction,
  ...LoginAttemptDispatchAction,
  ...LockoutDispatchAction,
  ...PreferencesDispatchAction,
  ...AuthenticationDispatchAction,
  ...DeepLinkDispatchAction,
}

export interface ReducerAction<R> {
  type: R
  payload?: Array<any>
}

export const reducer = <S extends State>(state: S, action: ReducerAction<DispatchAction>): S => {
  switch (action.type) {
    case PreferencesDispatchAction.ENABLE_DEVELOPER_MODE: {
      const choice = (action?.payload ?? []).pop() ?? false
      const preferences = { ...state.preferences, developerModeEnabled: choice }

      AsyncStorage.setItem(LocalStorageKeys.Preferences, JSON.stringify(preferences))

      return {
        ...state,
        preferences,
      }
    }
    case PreferencesDispatchAction.USE_BIOMETRY: {
      const choice = (action?.payload ?? []).pop() ?? false
      const preferences = {
        ...state.preferences,
        useBiometry: choice,
      }
      const onboarding = {
        ...state.onboarding,
        didConsiderBiometry: true,
      }
      const newState = {
        ...state,
        onboarding,
        preferences,
      }

      AsyncStorage.setItem(LocalStorageKeys.Onboarding, JSON.stringify(onboarding))
      AsyncStorage.setItem(LocalStorageKeys.Preferences, JSON.stringify(preferences))

      return newState
    }
    case PreferencesDispatchAction.BIOMETRY_PREFERENCES_UPDATED: {
      const updatePending = (action?.payload ?? []).pop() ?? false
      const preferences = { ...state.preferences, biometryPreferencesUpdated: updatePending }
      return {
        ...state,
        preferences,
      }
    }
    case PreferencesDispatchAction.PREFERENCES_UPDATED: {
      const preferences: PreferencesState = (action?.payload || []).pop()
      return {
        ...state,
        preferences,
      }
    }
    case LoginAttemptDispatchAction.ATTEMPT_UPDATED: {
      const loginAttempt: LoginAttemptState = (action?.payload || []).pop()
      const newState = {
        ...state,
        loginAttempt,
      }
      AsyncStorage.setItem(LocalStorageKeys.LoginAttempts, JSON.stringify(newState.loginAttempt))
      return newState
    }
    case LockoutDispatchAction.LOCKOUT_UPDATED: {
      const lockout: LockoutState = (action?.payload || []).pop()
      return {
        ...state,
        lockout,
      }
    }
    case OnboardingDispatchAction.ONBOARDING_UPDATED: {
      const onboarding: OnboardingState = (action?.payload || []).pop()
      return {
        ...state,
        onboarding,
      }
    }
    case OnboardingDispatchAction.DID_COMPLETE_TUTORIAL: {
      const onboarding = {
        ...state.onboarding,
        didCompleteTutorial: true,
      }
      const newState = {
        ...state,
        onboarding,
      }
      AsyncStorage.setItem(LocalStorageKeys.Onboarding, JSON.stringify(newState.onboarding))
      return newState
    }
    case OnboardingDispatchAction.DID_AGREE_TO_TERMS: {
      const onboarding: OnboardingState = {
        ...state.onboarding,
        didAgreeToTerms: true,
      }
      const newState = {
        ...state,
        onboarding,
      }
      AsyncStorage.setItem(LocalStorageKeys.Onboarding, JSON.stringify(newState.onboarding))
      return newState
    }
    case OnboardingDispatchAction.DID_CREATE_PIN: {
      const onboarding: OnboardingState = {
        ...state.onboarding,
        didCreatePIN: true,
      }
      const newState = {
        ...state,
        onboarding,
      }
      AsyncStorage.setItem(LocalStorageKeys.Onboarding, JSON.stringify(newState.onboarding))
      return newState
    }
    case AuthenticationDispatchAction.DID_AUTHENTICATE: {
      const value: AuthenticationState = (action?.payload || []).pop()
      const payload = value ?? { didAuthenticate: true }
      const newState = {
        ...state,
        ...{ authentication: payload },
      }
      return newState
    }
    case ErrorDispatchAction.ERROR_ADDED: {
      const { error } = (action?.payload || []).pop()
      return {
        ...state,
        error,
      }
    }
    case ErrorDispatchAction.ERROR_REMOVED: {
      return {
        ...state,
        error: null,
      }
    }
    case DeepLinkDispatchAction.ACTIVE_DEEP_LINK: {
      const value = (action?.payload || []).pop()
      return {
        ...state,
        ...{ deepLink: { activeDeepLink: value } },
      }
    }
    default:
      return state
  }
}

export default reducer
