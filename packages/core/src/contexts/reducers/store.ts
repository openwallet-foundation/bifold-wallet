import { LocalStorageKeys } from '../../constants'
import { storeLoginAttempt } from '../../services/keychain'
import {
  Preferences as PreferencesState,
  Tours as ToursState,
  Onboarding as OnboardingState,
  Authentication as AuthenticationState,
  Lockout as LockoutState,
  LoginAttempt as LoginAttemptState,
  Migration as MigrationState,
  State,
  Preferences,
} from '../../types/state'
import { generateRandomWalletName } from '../../utils/helpers'
import { PersistentStorage } from '../../services/storage'
import Config from 'react-native-config'

enum StateDispatchAction {
  STATE_DISPATCH = 'state/stateDispatch',
}

enum OnboardingDispatchAction {
  ONBOARDING_UPDATED = 'onboarding/onboardingStateLoaded',
  DID_SEE_PREFACE = 'onboarding/didSeePreface',
  DID_COMPLETE_TUTORIAL = 'onboarding/didCompleteTutorial',
  DID_AGREE_TO_TERMS = 'onboarding/didAgreeToTerms',
  DID_CREATE_PIN = 'onboarding/didCreatePIN',
  DID_NAME_WALLET = 'onboarding/didNameWallet',
  DID_COMPLETE_ONBOARDING = 'onboarding/didCompleteOnboarding',
  ONBOARDING_VERSION = 'onboarding/onboardingVersion',
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
  USE_PUSH_NOTIFICATIONS = 'preferences/usePushNotifications',
  PREFERENCES_UPDATED = 'preferences/preferencesStateLoaded',
  USE_VERIFIER_CAPABILITY = 'preferences/useVerifierCapability',
  USE_CONNECTION_INVITER_CAPABILITY = 'preferences/useConnectionInviterCapability',
  USE_DEV_VERIFIER_TEMPLATES = 'preferences/useDevVerifierTemplates',
  ENABLE_WALLET_NAMING = 'preferences/enableWalletNaming',
  UPDATE_WALLET_NAME = 'preferences/updateWalletName',
  ACCEPT_DEV_CREDENTIALS = 'preferences/acceptDevCredentials',
  USE_DATA_RETENTION = 'preferences/useDataRetention',
  PREVENT_AUTO_LOCK = 'preferences/preventAutoLock',
  USE_SHAREABLE_LINK = 'preferences/useShareableLink',
  UPDATE_ALTERNATE_CONTACT_NAMES = 'preferences/updateAlternateContactNames',
  AUTO_LOCK_TIME = 'preferences/autoLockTime',
  SET_THEME = 'preferences/setTheme',
  SET_SELECTED_MEDIATOR = 'preferences/setSelectedMediator',
  ADD_AVAILABLE_MEDIATOR = 'preferences/addAvailableMediator',
  RESET_MEDIATORS = 'preferences/resetMediators',
  BANNER_MESSAGES = 'preferences/bannerMessages',
  REMOVE_BANNER_MESSAGE = 'REMOVE_BANNER_MESSAGE',
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

enum AppStatusDispatchAction {
  SET_VERSION_INFO = 'appStatus/checkVersionUpdate',
}

export type DispatchAction =
  | StateDispatchAction
  | OnboardingDispatchAction
  | LoginAttemptDispatchAction
  | LockoutDispatchAction
  | PreferencesDispatchAction
  | ToursDispatchAction
  | AuthenticationDispatchAction
  | DeepLinkDispatchAction
  | MigrationDispatchAction
  | AppStatusDispatchAction

export const DispatchAction = {
  ...StateDispatchAction,
  ...OnboardingDispatchAction,
  ...LoginAttemptDispatchAction,
  ...LockoutDispatchAction,
  ...PreferencesDispatchAction,
  ...ToursDispatchAction,
  ...AuthenticationDispatchAction,
  ...DeepLinkDispatchAction,
  ...MigrationDispatchAction,
  ...AppStatusDispatchAction,
}

export interface ReducerAction<R> {
  type: R
  payload?: Array<any>
}

export const reducer = <S extends State>(state: S, action: ReducerAction<DispatchAction>): S => {
  switch (action.type) {
    case AppStatusDispatchAction.SET_VERSION_INFO: {
      const info = (action.payload || []).pop()
      const versionInfo = { ...state.versionInfo, ...info }

      return { ...state, versionInfo }
    }
    case StateDispatchAction.STATE_DISPATCH: {
      const newState: State = (action?.payload || []).pop()
      return { ...state, ...newState, stateLoaded: true }
    }
    case PreferencesDispatchAction.ENABLE_DEVELOPER_MODE: {
      const choice = (action?.payload ?? []).pop() ?? false
      const preferences = { ...state.preferences, developerModeEnabled: choice }

      PersistentStorage.storeValueForKey(LocalStorageKeys.Preferences, preferences)

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

      PersistentStorage.storeValueForKey(LocalStorageKeys.Onboarding, onboarding)
      PersistentStorage.storeValueForKey(LocalStorageKeys.Preferences, preferences)

      return newState
    }
    case PreferencesDispatchAction.USE_PUSH_NOTIFICATIONS: {
      const choice = (action?.payload ?? []).pop() ?? false
      const preferences = {
        ...state.preferences,
        usePushNotifications: choice,
      }
      const onboarding = {
        ...state.onboarding,
        didConsiderPushNotifications: true,
      }
      const newState = {
        ...state,
        onboarding,
        preferences,
      }

      PersistentStorage.storeValueForKey(LocalStorageKeys.Onboarding, onboarding)
      PersistentStorage.storeValueForKey(LocalStorageKeys.Preferences, preferences)

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

      PersistentStorage.storeValueForKey(LocalStorageKeys.Preferences, preferences)

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

      PersistentStorage.storeValueForKey(LocalStorageKeys.Preferences, preferences)

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

      PersistentStorage.storeValueForKey(LocalStorageKeys.Preferences, preferences)

      return newState
    }
    case PreferencesDispatchAction.ACCEPT_DEV_CREDENTIALS: {
      const choice = (action?.payload ?? []).pop() ?? false
      const preferences = {
        ...state.preferences,
        acceptDevCredentials: choice,
      }
      const newState = {
        ...state,
        preferences,
      }

      PersistentStorage.storeValueForKey(LocalStorageKeys.Preferences, preferences)

      return newState
    }
    case PreferencesDispatchAction.USE_DATA_RETENTION: {
      const choice = (action?.payload ?? []).pop() ?? false
      const preferences = {
        ...state.preferences,
        useDataRetention: choice,
      }
      const newState = {
        ...state,
        preferences,
      }

      PersistentStorage.storeValueForKey(LocalStorageKeys.Preferences, preferences)

      return newState
    }
    case PreferencesDispatchAction.PREFERENCES_UPDATED: {
      const preferences: PreferencesState = (action?.payload || []).pop()
      // For older wallets that haven't explicitly named their wallet yet
      if (!preferences.walletName) {
        preferences.walletName = generateRandomWalletName()
      }
      // For older wallets initialized before data retention option was created
      if (preferences.useDataRetention === undefined) {
        preferences.useDataRetention = true
      }

      if (!preferences.alternateContactNames) {
        preferences.alternateContactNames = {}
      }

      return {
        ...state,
        preferences,
      }
    }
    case PreferencesDispatchAction.ENABLE_WALLET_NAMING: {
      const choice = (action?.payload ?? []).pop() ?? false
      const preferences = { ...state.preferences, enableWalletNaming: choice }

      PersistentStorage.storeValueForKey(LocalStorageKeys.Preferences, preferences)

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

      PersistentStorage.storeValueForKey(LocalStorageKeys.Preferences, preferences)

      return newState
    }
    case PreferencesDispatchAction.PREVENT_AUTO_LOCK: {
      const choice = (action?.payload ?? []).pop() ?? false
      const preferences = { ...state.preferences, preventAutoLock: choice }

      PersistentStorage.storeValueForKey(LocalStorageKeys.Preferences, preferences)

      return {
        ...state,
        preferences,
      }
    }
    case PreferencesDispatchAction.USE_SHAREABLE_LINK: {
      const choice = (action?.payload ?? []).pop() ?? false
      const preferences = { ...state.preferences, enableShareableLink: choice }

      PersistentStorage.storeValueForKey(LocalStorageKeys.Preferences, preferences)

      return {
        ...state,
        preferences,
      }
    }
    case PreferencesDispatchAction.UPDATE_ALTERNATE_CONTACT_NAMES: {
      const idNamePair = (action?.payload ?? []).pop() ?? {}
      const preferences = {
        ...state.preferences,
        alternateContactNames: {
          ...state.preferences.alternateContactNames,
          ...idNamePair,
        },
      }
      const newState = {
        ...state,
        preferences,
      }

      PersistentStorage.storeValueForKey(LocalStorageKeys.Preferences, preferences)

      return newState
    }
    case PreferencesDispatchAction.SET_THEME: {
      const theme = (action?.payload ?? []).pop() ?? ''
      const preferences = { ...state.preferences, theme }

      PersistentStorage.storeValueForKey(LocalStorageKeys.Preferences, preferences)

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

      PersistentStorage.storeValueForKey(LocalStorageKeys.Tours, tours)

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

      PersistentStorage.storeValueForKey(LocalStorageKeys.Tours, tours)

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

      PersistentStorage.storeValueForKey(LocalStorageKeys.Tours, tours)

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

      PersistentStorage.storeValueForKey(LocalStorageKeys.Tours, tours)

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

      PersistentStorage.storeValueForKey(LocalStorageKeys.Tours, tours)

      return newState
    }

    case LoginAttemptDispatchAction.ATTEMPT_UPDATED: {
      const loginAttempt: LoginAttemptState = (action?.payload || []).pop()
      const newState = {
        ...state,
        loginAttempt,
      }
      storeLoginAttempt(loginAttempt)
      return newState
    }
    case LockoutDispatchAction.LOCKOUT_UPDATED: {
      const { displayNotification }: LockoutState = (action?.payload ?? []).pop() ?? { displayNotification: false }
      const lockout: LockoutState = {
        ...state.lockout,
        displayNotification,
      }

      return {
        ...state,
        lockout,
      }
    }
    case PreferencesDispatchAction.AUTO_LOCK_TIME: {
      const autoLockTime = (action?.payload ?? []).pop() ?? 5
      const preferences: Preferences = {
        ...state.preferences,
        autoLockTime,
      }
      PersistentStorage.storeValueForKey(LocalStorageKeys.Preferences, preferences)
      return {
        ...state,
        preferences,
      }
    }
    case PreferencesDispatchAction.SET_SELECTED_MEDIATOR: {
      const selectedMediator = (action?.payload ?? []).pop() ?? state.preferences.selectedMediator
      const preferences: Preferences = {
        ...state.preferences,
        selectedMediator,
      }
      PersistentStorage.storeValueForKey(LocalStorageKeys.Preferences, preferences)
      return {
        ...state,
        preferences,
      }
    }
    case PreferencesDispatchAction.ADD_AVAILABLE_MEDIATOR: {
      const mediatorToAdd = (action?.payload ?? []).pop() ?? ''
      if (!state.preferences.availableMediators.includes(mediatorToAdd)) {
        const updatedAvailableMediators = [...state.preferences.availableMediators, mediatorToAdd]
        const preferences: Preferences = {
          ...state.preferences,
          availableMediators: updatedAvailableMediators,
        }
        PersistentStorage.storeValueForKey(LocalStorageKeys.Preferences, preferences)
        return {
          ...state,
          preferences,
        }
      }
      return state
    }
    case PreferencesDispatchAction.RESET_MEDIATORS: {
      const preferences: Preferences = {
        ...state.preferences,
        availableMediators: [Config.MEDIATOR_URL as string],
        selectedMediator: Config.MEDIATOR_URL as string,
      }

      PersistentStorage.storeValueForKey(LocalStorageKeys.Preferences, preferences)
      return {
        ...state,
        preferences,
      }
    }

    case PreferencesDispatchAction.BANNER_MESSAGES: {
      const bannerMessageToAdd = action?.payload ?? []
      const newBannerMessages = [...state.preferences.bannerMessages, ...bannerMessageToAdd]
      const preferences: Preferences = {
        ...state.preferences,
        bannerMessages: newBannerMessages,
      }
      PersistentStorage.storeValueForKey(LocalStorageKeys.Preferences, preferences)
      return {
        ...state,
        preferences,
      }
    }

    case PreferencesDispatchAction.REMOVE_BANNER_MESSAGE: {
      const keysToRemove = action?.payload ?? []
      const newBannerMessages = state.preferences.bannerMessages.filter((msg) => !keysToRemove.includes(msg.id))
      const preferences: Preferences = {
        ...state.preferences,
        bannerMessages: newBannerMessages,
      }
      PersistentStorage.storeValueForKey(LocalStorageKeys.Preferences, preferences)
      return {
        ...state,
        preferences,
      }
    }

    case OnboardingDispatchAction.ONBOARDING_VERSION: {
      const version = (action?.payload || []).pop()
      const onboarding = {
        ...state.onboarding,
        onboardingVersion: version,
      }
      const newState = {
        ...state,
        onboarding,
      }
      PersistentStorage.storeValueForKey(LocalStorageKeys.Onboarding, newState.onboarding)
      return newState
    }
    case OnboardingDispatchAction.DID_COMPLETE_ONBOARDING: {
      const onboarding = {
        ...state.onboarding,
        didCompleteOnboarding: true,
      }
      const newState = {
        ...state,
        onboarding,
      }
      PersistentStorage.storeValueForKey(LocalStorageKeys.Onboarding, newState.onboarding)
      return newState
    }
    case OnboardingDispatchAction.ONBOARDING_UPDATED: {
      const onboarding: OnboardingState = (action?.payload || []).pop()
      return {
        ...state,
        onboarding,
      }
    }
    case OnboardingDispatchAction.DID_SEE_PREFACE: {
      const onboarding = {
        ...state.onboarding,
        didSeePreface: true,
      }
      const newState = {
        ...state,
        onboarding,
      }
      PersistentStorage.storeValueForKey(LocalStorageKeys.Onboarding, newState.onboarding)
      return newState
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
      PersistentStorage.storeValueForKey(LocalStorageKeys.Onboarding, newState.onboarding)
      return newState
    }
    case OnboardingDispatchAction.DID_AGREE_TO_TERMS: {
      const terms = (action?.payload || []).pop()
      const version = terms?.DidAgreeToTerms
      const onboarding: OnboardingState = {
        ...state.onboarding,
        didAgreeToTerms: version ?? true,
      }
      const newState = {
        ...state,
        onboarding,
      }
      PersistentStorage.storeValueForKey(LocalStorageKeys.Onboarding, newState.onboarding)
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

      // Reset any login attempts and penalty in keychain
      // Since the app is being reinstalled, we can erase the login attempts from keychain
      // in the previous installation
      const loginAttempt: LoginAttemptState = {
        loginAttempts: 0,
        servedPenalty: true,
      }

      const newState = {
        ...state,
        onboarding,
        migration,
        loginAttempt,
      }
      storeLoginAttempt(loginAttempt)
      PersistentStorage.storeValueForKey(LocalStorageKeys.Onboarding, newState.onboarding)
      PersistentStorage.storeValueForKey(LocalStorageKeys.Migration, newState.migration)
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

      PersistentStorage.storeValueForKey(LocalStorageKeys.Onboarding, onboarding)

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
      PersistentStorage.storeValueForKey(LocalStorageKeys.Migration, newState.migration)
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
      const didAuthenticate: boolean = (action?.payload || []).pop() ?? true
      const authentication: AuthenticationState = {
        didAuthenticate,
      }
      return {
        ...state,
        authentication,
      }
    }
    case DeepLinkDispatchAction.ACTIVE_DEEP_LINK: {
      const value: string = (action?.payload || []).pop()
      return {
        ...state,
        deepLink: value,
      }
    }
    default:
      return state
  }
}

export default reducer
