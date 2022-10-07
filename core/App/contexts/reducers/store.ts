import AsyncStorage from '@react-native-async-storage/async-storage'

import { LocalStorageKeys } from '../../constants'
import {
  Privacy as PrivacyState,
  Preferences as PreferencesState,
  Onboarding as OnboardingState,
  Credential as CredentialState,
  Authentication as AuthenticationState,
  Lockout as LockoutState,
  LoginAttempt as LoginAttemptState,
  State,
} from '../../types/state'

enum OnboardingDispatchAction {
  ONBOARDING_UPDATED = 'onboarding/onboardingStateLoaded',
  DID_COMPLETE_TUTORIAL = 'onboarding/didCompleteTutorial',
  DID_AGREE_TO_TERMS = 'onboarding/didAgreeToTerms',
  DID_CREATE_PIN = 'onboarding/didCreatePin',
}

enum ErrorDispatchAction {
  ERROR_ADDED = 'error/errorAdded',
  ERROR_REMOVED = 'error/errorRemoved',
}

// FIXME: Once hooks are updated this should no longer be necessary
enum CredentialDispatchAction {
  CREDENTIALS_UPDATED = 'credentials/credentialsUpdated',
  CREDENTIAL_REVOKED = 'credentials/credentialRevoked',
  CREDENTIAL_REVOKED_MESSAGE_DISMISSED = 'credentials/credentialRevokedMessageDismissed',
}

enum LockoutDispatchAction {
  LOCKOUT_UPDATED = 'lockout/lockoutUpdated',
}

enum LoginAttemptDispatchAction {
  ATTEMPT_UPDATED = 'loginAttempt/loginAttemptUpdated',
}
enum PrivacyDispatchAction {
  DID_SHOW_CAMERA_DISCLOSURE = 'privacy/didShowCameraDisclosure',
  PRIVACY_UPDATED = 'privacy/privacyStateLoaded',
}

enum PreferencesDispatchAction {
  USE_BIOMETRY = 'preferences/useBiometry',
  PREFERENCES_UPDATED = 'preferences/preferencesStateLoaded',
}

enum AuthenticationDispatchAction {
  DID_AUTHENTICATE = 'authentication/didAuthenticate',
}

export type DispatchAction =
  | OnboardingDispatchAction
  | ErrorDispatchAction
  | CredentialDispatchAction
  | PrivacyDispatchAction
  | LoginAttemptDispatchAction
  | LockoutDispatchAction
  | PreferencesDispatchAction
  | AuthenticationDispatchAction

export const DispatchAction = {
  ...OnboardingDispatchAction,
  ...ErrorDispatchAction,
  ...CredentialDispatchAction,
  ...PrivacyDispatchAction,
  ...LoginAttemptDispatchAction,
  ...LockoutDispatchAction,
  ...PreferencesDispatchAction,
  ...AuthenticationDispatchAction,
}

export interface ReducerAction {
  type: DispatchAction
  payload?: Array<any>
}

const reducer = (state: State, action: ReducerAction): State => {
  switch (action.type) {
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
    case PreferencesDispatchAction.PREFERENCES_UPDATED: {
      const preferences: PreferencesState = (action?.payload || []).pop()
      return {
        ...state,
        preferences,
      }
    }
    case PrivacyDispatchAction.DID_SHOW_CAMERA_DISCLOSURE: {
      const newState = {
        ...state,
        ...{ privacy: { didShowCameraDisclosure: true } },
      }

      AsyncStorage.setItem(LocalStorageKeys.Privacy, JSON.stringify(newState.privacy))

      return newState
    }
    case PrivacyDispatchAction.PRIVACY_UPDATED: {
      const privacy: PrivacyState = (action?.payload || []).pop()
      return {
        ...state,
        privacy,
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
    // FIXME: Once hooks are updated this should no longer be necessary
    case CredentialDispatchAction.CREDENTIALS_UPDATED: {
      const credential: CredentialState = (action?.payload || []).pop()
      return {
        ...state,
        credential,
      }
    }
    case CredentialDispatchAction.CREDENTIAL_REVOKED: {
      const revokedCredential = (action.payload || []).pop()
      const revoked = state.credential.revoked
      revoked.add(revokedCredential.id || revokedCredential.credentialId)
      const credential: CredentialState = {
        ...state.credential,
        revoked,
      }
      const newState = {
        ...state,
        credential,
      }
      AsyncStorage.setItem(LocalStorageKeys.RevokedCredentials, JSON.stringify(Array.from(revoked.values())))
      return newState
    }
    case CredentialDispatchAction.CREDENTIAL_REVOKED_MESSAGE_DISMISSED: {
      const revokedCredential = (action.payload || []).pop()
      const revokedMessageDismissed = state.credential.revokedMessageDismissed
      revokedMessageDismissed.add(revokedCredential.id || revokedCredential.credentialId)
      const credential: CredentialState = {
        ...state.credential,
        revokedMessageDismissed,
      }
      const newState = {
        ...state,
        credential,
      }
      AsyncStorage.setItem(
        LocalStorageKeys.RevokedCredentialsMessageDismissed,
        JSON.stringify(Array.from(revokedMessageDismissed.values()))
      )
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
    default:
      return state
  }
}

export default reducer
