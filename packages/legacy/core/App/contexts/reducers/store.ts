import AsyncStorage from '@react-native-async-storage/async-storage'

import { LocalStorageKeys } from '../../constants'
import {
  Preferences as PreferencesState,
  Tours as ToursState,
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

enum LockoutDispatchAction {
  LOCKOUT_UPDATED = 'lockout/lockoutUpdated',
}

enum LoginAttemptDispatchAction {
  ATTEMPT_UPDATED = 'loginAttempt/loginAttemptUpdated',
}

enum PreferencesDispatchAction {
  ENABLE_DEVELOPER_MODE = 'preferences/enableDeveloperMode',
  USE_BIOMETRY = 'preferences/useBiometry',
  PREFERENCES_UPDATED = 'preferences/preferencesStateLoaded',
  USE_VERIFIER_CAPABILITY = 'preferences/useVerifierCapability',
  USE_CONNECTION_INVITER_CAPABILITY = 'preferences/useConnectionInviterCapability',
}

enum ToursDispatchAction {
  TOUR_DATA_UPDATED = 'tours/tourDataUpdated',
  UPDATE_SEEN_TOUR_PROMPT = 'tours/seenTourPrompt',
  ENABLE_TOURS = 'tours/enableTours',
  UPDATE_SEEN_HOME_TOUR = 'tours/seenHomeTour',
}

enum AuthenticationDispatchAction {
  DID_AUTHENTICATE = 'authentication/didAuthenticate',
}

enum DeepLinkDispatchAction {
  ACTIVE_DEEP_LINK = 'deepLink/activeDeepLink',
}

export type DispatchAction =
  | OnboardingDispatchAction
  | LoginAttemptDispatchAction
  | LockoutDispatchAction
  | PreferencesDispatchAction
  | ToursDispatchAction
  | AuthenticationDispatchAction
  | DeepLinkDispatchAction

export const DispatchAction = {
  ...OnboardingDispatchAction,
  ...LoginAttemptDispatchAction,
  ...LockoutDispatchAction,
  ...PreferencesDispatchAction,
  ...ToursDispatchAction,
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
    case PreferencesDispatchAction.USE_VERIFIER_CAPABILITY: {
      const choice = (action?.payload ?? []).pop() ?? false
      const preferences = {
        ...state.preferences,
        useVerifierCapability: choice,
      }
      const newState = {
        ...state,
        preferences,
      }

      AsyncStorage.setItem(LocalStorageKeys.Preferences, JSON.stringify(preferences))

      return newState
    }
    case PreferencesDispatchAction.USE_CONNECTION_INVITER_CAPABILITY: {
      const choice = (action?.payload ?? []).pop() ?? false
      const preferences = {
        ...state.preferences,
        useConnectionInviterCapability: choice,
      }
      const newState = {
        ...state,
        preferences,
      }

      AsyncStorage.setItem(LocalStorageKeys.Preferences, JSON.stringify(preferences))

      return newState
    }
    case PreferencesDispatchAction.PREFERENCES_UPDATED: {
      const preferences: PreferencesState = (action?.payload || []).pop()
      return {
        ...state,
        preferences,
      }
    }
    case ToursDispatchAction.UPDATE_SEEN_TOUR_PROMPT: {
      const seenToursPrompt: ToursState = (action?.payload ?? []).pop() ?? false
      const tours = {
        ...state.tours,
        seenToursPrompt,
      }
      const newState = {
        ...state,
        tours,
      }

      return newState
    }
    case ToursDispatchAction.TOUR_DATA_UPDATED: {
      const tourData: ToursState = (action?.payload ?? []).pop() ?? {}
      const tours = {
        ...state.tours,
        ...tourData,
      }
      const newState = {
        ...state,
        tours,
      }

      return newState
    }
    case ToursDispatchAction.ENABLE_TOURS: {
      const enableTours = (action?.payload ?? []).pop() ?? false
      const tours = {
        ...state.tours,
      }
      if (enableTours) {
        tours.enableTours = enableTours
        tours.seenHomeTour = false
      } else {
        tours.enableTours = enableTours
      }
      const newState = {
        ...state,
        tours,
      }

      AsyncStorage.setItem(LocalStorageKeys.Tours, JSON.stringify(tours))

      return newState
    }
    case ToursDispatchAction.UPDATE_SEEN_HOME_TOUR: {
      const seenHomeTour = (action?.payload ?? []).pop() ?? false
      const tours = {
        ...state.tours,
        seenHomeTour,
      }

      if (seenHomeTour) {
        tours.enableTours = false
      }

      const newState = {
        ...state,
        tours,
      }

      AsyncStorage.setItem(LocalStorageKeys.Tours, JSON.stringify(tours))

      return newState
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
