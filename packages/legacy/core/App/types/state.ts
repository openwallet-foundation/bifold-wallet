export interface Onboarding {
  didCompleteTutorial: boolean
  didAgreeToTerms: boolean
  didCreatePIN: boolean
  didConsiderBiometry: boolean
  didNameWallet: boolean
}

export interface Migration {
  didMigrateToAskar: boolean
}

export interface Preferences {
  useBiometry: boolean
  biometryPreferencesUpdated: boolean
  developerModeEnabled: boolean
  useVerifierCapability?: boolean
  useConnectionInviterCapability?: boolean
  useDevVerifierTemplates?: boolean
  enableWalletNaming: boolean
  walletName: string
  acceptDevCredentials: boolean
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

export interface DeepLink {
  activeDeepLink?: string
}

export interface State {
  onboarding: Onboarding
  authentication: Authentication
  lockout: Lockout
  loginAttempt: LoginAttempt
  preferences: Preferences
  tours: Tours
  deepLink: DeepLink
  migration: Migration
  loading: boolean
}
