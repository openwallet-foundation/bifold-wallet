import { State } from "../../App/types/state";

export const defaultState: State = {
    onboarding: {
      didAgreeToTerms: false,
      didCompleteTutorial: false,
      didCreatePIN: false,
      didConsiderBiometry: false,
      didNameWallet: false,
    },
    authentication: {
      didAuthenticate: false,
    },
    // NOTE: from AFJ 0.4.0 on we use Aries Askar. New wallets will be created with Askar from the start
    // which we will know when we create the pin while using askar as a dependency.
    migration: {
      didMigrateToAskar: false,
    },
    loginAttempt: {
      loginAttempts: 0,
      servedPenalty: true,
    },
    lockout: {
      displayNotification: false,
    },
    preferences: {
      developerModeEnabled: false,
      biometryPreferencesUpdated: false,
      useBiometry: false,
      useVerifierCapability: false,
      useConnectionInviterCapability: false,
      useDevVerifierTemplates: false,
      acceptDevCredentials: false,
      useDataRetention: true,
      enableWalletNaming: false,
      walletName: 'test-wallet',
    },
    tours: {
      seenToursPrompt: false,
      enableTours: true,
      seenHomeTour: false,
      seenCredentialsTour: false,
      seenCredentialOfferTour: false,
      seenProofRequestTour: false,
    },
    deepLink: {
      activeDeepLink: '',
    },
    loading: false,
  }
