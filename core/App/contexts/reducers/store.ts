import AsyncStorage from '@react-native-async-storage/async-storage'

import { LocalStorageKeys } from '../../constants'
import {
  Onboarding as OnboardingState,
  Credential as CredentialState,
  State,
  User as UserState,
} from '../../types/state'

enum OnboardingDispatchAction {
  ONBOARDING_UPDATED = 'onboarding/onboardingStateLoaded',
  DID_COMPLETE_TUTORIAL = 'onboarding/didCompleteTutorial',
  DID_AGREE_TO_PRIVACY = 'onboarding/didAgreeToPrivacy',
  DID_AGREE_TO_TERMS = 'onboarding/didAgreeToTerms',
  DID_CREATE_DISPLAY_NAME = 'onboarding/didCreateDisplayName',
  DID_CREATE_PIN = 'onboarding/didCreatePin',
  RESET_ONBOARDING = 'onboarding/resetOnboarding',
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

enum LoadingDispatchAction {
  LOADING_ENABLED = 'loading/loadingEnabled',
  LOADING_DISABLED = 'loading/loadingDisabled',
}

enum UserDispatchAction {
  FIRST_NAME_UPDATED = 'user/firstNameUpdated',
  LAST_NAME_UPDATED = 'user/lastNameUpdated',
  USER_UPDATED = 'user/userStateLoaded',
}

export type DispatchAction =
  | OnboardingDispatchAction
  | ErrorDispatchAction
  | CredentialDispatchAction
  | LoadingDispatchAction
  | UserDispatchAction

export const DispatchAction = {
  ...OnboardingDispatchAction,
  ...ErrorDispatchAction,
  ...CredentialDispatchAction,
  ...LoadingDispatchAction,
  ...UserDispatchAction,
}

export interface ReducerAction {
  type: DispatchAction
  payload?: Array<any>
}

const reducer = (state: State, action: ReducerAction): State => {
  switch (action.type) {
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
    case OnboardingDispatchAction.DID_AGREE_TO_PRIVACY: {
      const onboarding: OnboardingState = {
        ...state.onboarding,
        didAgreeToPrivacy: true,
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
    case OnboardingDispatchAction.DID_CREATE_DISPLAY_NAME: {
      const onboarding: OnboardingState = {
        ...state.onboarding,
        didCreateDisplayName: true,
      }
      const newState = {
        ...state,
        onboarding,
      }
      AsyncStorage.setItem(LocalStorageKeys.Onboarding, JSON.stringify(newState.onboarding))
      return newState
    }
    case OnboardingDispatchAction.RESET_ONBOARDING: {
      const onboarding: OnboardingState = {
        ...state.onboarding,
        didCompleteTutorial: false,
        didAgreeToPrivacy: false,
        didAgreeToTerms: false,
        didCreatePIN: false,
      }
      const newState = {
        ...state,
        onboarding,
      }
      AsyncStorage.setItem(LocalStorageKeys.Onboarding, JSON.stringify(newState.onboarding))
      return newState
    }
    case UserDispatchAction.USER_UPDATED: {
      const user: UserState = (action?.payload || []).pop()
      return {
        ...state,
        user,
      }
    }
    case UserDispatchAction.FIRST_NAME_UPDATED: {
      const user: UserState = {
        ...state.user,
        firstName: (action?.payload ?? ['']).pop(),
      }
      const newState = {
        ...state,
        user,
      }

      AsyncStorage.setItem(LocalStorageKeys.User, JSON.stringify(user))

      return newState
    }
    case UserDispatchAction.LAST_NAME_UPDATED: {
      const user: UserState = {
        ...state.user,
        lastName: (action?.payload ?? ['']).pop(),
      }
      const newState = {
        ...state,
        user,
      }

      AsyncStorage.setItem(LocalStorageKeys.User, JSON.stringify(user))

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
    case LoadingDispatchAction.LOADING_ENABLED: {
      return {
        ...state,
        loading: true,
      }
    }
    case LoadingDispatchAction.LOADING_DISABLED: {
      return {
        ...state,
        loading: false,
      }
    }
    default:
      return state
  }
}

export default reducer
