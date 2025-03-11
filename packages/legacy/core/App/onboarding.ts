import { Screens, OnboardingTask } from '@hyperledger/aries-bifold-core'

import { BCState } from '../store'

import { TermsVersion } from './Terms'

export type OnboardingConfig = {
  showPreface: boolean
  enableWalletNaming: boolean
  enablePushNotifications: boolean
}

export const isPrefaceComplete = (didSeePreface: boolean, showPreface = true): OnboardingTask => {
  return { name: Screens.Preface, completed: (didSeePreface && showPreface) || !showPreface }
}

export const isOnboardingTutorialComplete = (didCompleteTutorial: boolean): OnboardingTask => {
  return { name: Screens.Onboarding, completed: didCompleteTutorial }
}

export const isTermsComplete = (didAgreeToTerms: Number, termsVersion: TermsVersion): OnboardingTask => {
  return { name: Screens.Terms, completed: didAgreeToTerms === termsVersion }
}

export const isPINCreationComplete = (didCreatePIN: boolean): OnboardingTask => {
  return { name: Screens.CreatePIN, completed: didCreatePIN }
}

export const isBiometryComplete = (didConsiderBiometry: boolean): OnboardingTask => {
  return { name: Screens.UseBiometry, completed: didConsiderBiometry }
}

export const isPushNotificationComplete = (
  didConsiderPushNotifications: boolean,
  enablePushNotifications: any
): OnboardingTask => {
  return {
    name: Screens.UsePushNotifications,
    completed: !enablePushNotifications || (didConsiderPushNotifications && enablePushNotifications),
  }
}

export const isNameWalletComplete = (didNameWallet: boolean, enableWalletNaming: boolean): OnboardingTask => {
  return { name: Screens.NameWallet, completed: !enableWalletNaming && !didNameWallet }
}

export const isAuthenticationComplete = (didCreatePIN: boolean, didAuthenticate: boolean): OnboardingTask => {
  return { name: Screens.EnterPIN, completed: didAuthenticate || !didCreatePIN }
}

export const generateOnboardingWorkflowSteps = (
  state: BCState,
  config: OnboardingConfig,
  termsVersion: TermsVersion
): Array<OnboardingTask> => {
  const {
    didSeePreface,
    didCompleteTutorial,
    didAgreeToTerms,
    didCreatePIN,
    didConsiderBiometry,
    didConsiderPushNotifications,
    didNameWallet,
  } = state.onboarding
  const { didAuthenticate } = state.authentication
  const { enableWalletNaming } = state.preferences
  const { showPreface, enablePushNotifications } = config

  return [
    isPrefaceComplete(didSeePreface, showPreface),
    isOnboardingTutorialComplete(didCompleteTutorial),
    isTermsComplete(didAgreeToTerms, termsVersion),
    isPINCreationComplete(didCreatePIN),
    isBiometryComplete(didConsiderBiometry),
    isPushNotificationComplete(didConsiderPushNotifications, enablePushNotifications),
    isNameWalletComplete(didNameWallet, enableWalletNaming),
    isAuthenticationComplete(didCreatePIN, didAuthenticate),
  ]
}
