import AsyncStorage from '@react-native-async-storage/async-storage'

import { LocalStorageKeys } from '../../constants'
import {
  Preferences as PreferencesState,
  Tours as ToursState,
  Onboarding as OnboardingState,
  Authentication as AuthenticationState,
  Lockout as LockoutState,
  LoginAttempt as LoginAttemptState,
  Migration as MigrationState,
  State,
} from '../../types/state'
import { generateRandomWalletName } from '../../utils/helpers'

enum OnboardingDispatchAction {
  ONBOARDING_UPDATED = 'onboarding/onboardingStateLoaded',
  DID_COMPLETE_TUTORIAL = 'onboarding/didCompleteTutorial',
  DID_AGREE_TO_TERMS = 'onboarding/didAgreeToTerms',
  DID_CREATE_PIN = 'onboarding/didCreatePIN',
  DID_NAME_WALLET = 'onboarding/didNameWallet',
}

enum MigrationDispatchAction {
  DID_MIGRATE_TO_ASKAR = 'migration/didMigrateToAskar',
  MIGRATION_UPDATED = 'migration/migrationStateLoaded',
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
  USE_DEV_VERIFIER_TEMPLATES = 'preferences/useDevVerifierTemplates',
  UPDATE_WALLET_NAME = 'preferences/updateWalletName',
}

enum ToursDispatchAction {
  TOUR_DATA_UPDATED = 'tours/tourDataUpdated',
  UPDATE_SEEN_TOUR_PROMPT = 'tours/seenTourPrompt',
  ENABLE_TOURS = 'tours/enableTours',
  UPDATE_SEEN_HOME_TOUR = 'tours/seenHomeTour',
  UPDATE_SEEN_CREDENTIALS_TOUR = 'tours/seenCredentialsTour',
  UPDATE_SEEN_CREDENTIAL_OFFER_TOUR = 'tours/seenCredentialOfferTour',
  UPDATE_SEEN_PROOF_REQUEST_TOUR = 'tours/seenProofRequestTour',
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
  | MigrationDispatchAction

export const DispatchAction = {
  ...OnboardingDispatchAction,
  ...LoginAttemptDispatchAction,
  ...LockoutDispatchAction,
  ...PreferencesDispatchAction,
  ...ToursDispatchAction,
  ...AuthenticationDispatchAction,
  ...DeepLinkDispatchAction,
  ...MigrationDispatchAction,
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
    case PreferencesDispatchAction.USE_DEV_VERIFIER_TEMPLATES: {
      const choice = (action?.payload ?? []).pop() ?? false
      const preferences = {
        ...state.preferences,
        useDevVerifierTemplates: choice,
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
      // For older wallets that haven't explicitly named their wallet yet
      if (!preferences.walletName) {
        preferences.walletName = generateRandomWalletName()
      }

      return {
        ...state,
        preferences,
      }
    }
    case PreferencesDispatchAction.UPDATE_WALLET_NAME: {
      // We should never see 'My Wallet - 123', that's just there to let us know something went wrong while saving the wallet name
      const name = (action?.payload ?? []).pop() ?? 'My Wallet - 123'
      const preferences = {
        ...state.preferences,
        walletName: name,
      }
      const newState = {
        ...state,
        preferences,
      }

      AsyncStorage.setItem(LocalStorageKeys.Preferences, JSON.stringify(preferences))

      return newState
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
        tours.seenCredentialsTour = false
        tours.seenCredentialOfferTour = false
        tours.seenProofRequestTour = false
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

      if (seenHomeTour && tours.seenCredentialsTour && tours.seenCredentialOfferTour && tours.seenProofRequestTour) {
        tours.enableTours = false
      }

      const newState = {
        ...state,
        tours,
      }

      AsyncStorage.setItem(LocalStorageKeys.Tours, JSON.stringify(tours))

      return newState
    }
    case ToursDispatchAction.UPDATE_SEEN_CREDENTIALS_TOUR: {
      const seenCredentialsTour = (action?.payload ?? []).pop() ?? false
      const tours = {
        ...state.tours,
        seenCredentialsTour,
      }

      if (seenCredentialsTour && tours.seenHomeTour && tours.seenCredentialOfferTour && tours.seenProofRequestTour) {
        tours.enableTours = false
      }

      const newState = {
        ...state,
        tours,
      }

      AsyncStorage.setItem(LocalStorageKeys.Tours, JSON.stringify(tours))

      return newState
    }
    case ToursDispatchAction.UPDATE_SEEN_CREDENTIAL_OFFER_TOUR: {
      const seenCredentialOfferTour = (action?.payload ?? []).pop() ?? false
      const tours = {
        ...state.tours,
        seenCredentialOfferTour,
      }

      if (seenCredentialOfferTour && tours.seenHomeTour && tours.seenCredentialsTour && tours.seenProofRequestTour) {
        tours.enableTours = false
      }

      const newState = {
        ...state,
        tours,
      }

      AsyncStorage.setItem(LocalStorageKeys.Tours, JSON.stringify(tours))

      return newState
    }
    case ToursDispatchAction.UPDATE_SEEN_PROOF_REQUEST_TOUR: {
      const seenProofRequestTour = (action?.payload ?? []).pop() ?? false
      const tours = {
        ...state.tours,
        seenProofRequestTour,
      }

      if (seenProofRequestTour && tours.seenHomeTour && tours.seenCredentialOfferTour && tours.seenCredentialsTour) {
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
      // If the pin is created with this version (that includes Askar), we
      // we can assume that a wallet using Indy SDK was never created. This
      // allows us to skip the migration step. For wallets initialized using
      // the indy sdk this won't be called, so the migration will be performed
      const migration: MigrationState = {
        ...state.migration,
        didMigrateToAskar: true,
      }
      const newState = {
        ...state,
        onboarding,
        migration,
      }
      AsyncStorage.setItem(LocalStorageKeys.Onboarding, JSON.stringify(newState.onboarding))
      AsyncStorage.setItem(LocalStorageKeys.Migration, JSON.stringify(newState.migration))
      return newState
    }
    case OnboardingDispatchAction.DID_NAME_WALLET: {
      const onboarding = {
        ...state.onboarding,
        didNameWallet: true,
      }
      const newState = {
        ...state,
        onboarding,
      }

      AsyncStorage.setItem(LocalStorageKeys.Onboarding, JSON.stringify(onboarding))

      return newState
    }
    case MigrationDispatchAction.DID_MIGRATE_TO_ASKAR: {
      const migration: MigrationState = {
        ...state.migration,
        didMigrateToAskar: true,
      }
      const newState = {
        ...state,
        migration,
      }
      AsyncStorage.setItem(LocalStorageKeys.Migration, JSON.stringify(newState.migration))
      return newState
    }
    case MigrationDispatchAction.MIGRATION_UPDATED: {
      const migration: MigrationState = (action?.payload || []).pop()
      return {
        ...state,
        migration,
      }
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
