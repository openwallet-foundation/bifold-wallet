export interface Onboarding {
  didSeePreface: boolean
  didCompleteTutorial: boolean
  didAgreeToTerms: boolean | string
  didCreatePIN: boolean
  didConsiderBiometry: boolean
  didConsiderPushNotifications: boolean
  didNameWallet: boolean
  onboardingVersion: number
  didCompleteOnboarding: boolean
  postAuthScreens: string[]
}

export interface Migration {
  didMigrateToAskar: boolean
}

export interface Preferences {
  useBiometry: boolean
  usePushNotifications: boolean
  biometryPreferencesUpdated: boolean
  developerModeEnabled: boolean
  useVerifierCapability?: boolean
  useConnectionInviterCapability?: boolean
  useHistoryCapability?: boolean
  useDevVerifierTemplates?: boolean
  enableWalletNaming: boolean
  walletName: string
  acceptDevCredentials: boolean
  useDataRetention: boolean
  disableDataRetentionOption?: boolean
  preventAutoLock: boolean
  enableShareableLink: boolean
  alternateContactNames: Record<string, string>
}

export interface Tours {
  seenToursPrompt: boolean
  enableTours: boolean
  seenHomeTour: boolean
  seenCredentialsTour: boolean
  seenCredentialOfferTour: boolean
  seenProofRequestTour: boolean
}

export interface Lockout {
  displayNotification: boolean
}

export interface LoginAttempt {
  lockoutDate?: number
  servedPenalty: boolean
  loginAttempts: number
}

export interface Authentication {
  didAuthenticate: boolean
}

export interface State {
  stateLoaded: boolean
  onboarding: Onboarding
  authentication: Authentication
  lockout: Lockout
  loginAttempt: LoginAttempt
  preferences: Preferences
  tours: Tours
  deepLink?: string
  migration: Migration
  loading: boolean
}
