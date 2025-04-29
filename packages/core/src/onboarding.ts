import { Agent } from '@credo-ts/core'
import { OnboardingTask, Screens } from './types/navigators'

import { Config } from './types/config'
import { State } from './types/state'

export const isPrefaceComplete = (didSeePreface: boolean, showPreface: boolean): OnboardingTask => {
  return { name: Screens.Preface, completed: (didSeePreface && showPreface) || !showPreface }
}

export const isUpdateCheckComplete = (): OnboardingTask => {
  return { name: Screens.UpdateAvailable, completed: true }
}

export const isOnboardingTutorialComplete = (didCompleteTutorial: boolean): OnboardingTask => {
  return { name: Screens.Onboarding, completed: didCompleteTutorial }
}

export const isTermsComplete = (didAgreeToTerms: number, termsVersion: number): OnboardingTask => {
  return { name: Screens.Terms, completed: didAgreeToTerms === termsVersion }
}

export const isPINCreationComplete = (didCreatePIN: boolean): OnboardingTask => {
  return { name: Screens.CreatePIN, completed: didCreatePIN }
}

export const isBiometryComplete = (didConsiderBiometry: boolean): OnboardingTask => {
  return { name: Screens.Biometry, completed: didConsiderBiometry }
}

export const isPushNotificationComplete = (
  didConsiderPushNotifications: boolean,
  enablePushNotifications: any
): OnboardingTask => {
  return {
    name: Screens.PushNotifications,
    completed: !enablePushNotifications || (didConsiderPushNotifications && enablePushNotifications),
  }
}

export const isNameWalletComplete = (didNameWallet: boolean, enableWalletNaming: boolean): OnboardingTask => {
  return { name: Screens.NameWallet, completed: didNameWallet || !enableWalletNaming }
}

export const isAuthenticationComplete = (didCreatePIN: boolean, didAuthenticate: boolean): OnboardingTask => {
  return { name: Screens.EnterPIN, completed: didAuthenticate || !didCreatePIN }
}

export const isAttemptLockoutComplete = (servedPenalty: boolean | undefined): OnboardingTask => {
  return { name: Screens.AttemptLockout, completed: servedPenalty !== false }
}

export const isAgentInitializationComplete = (agent: Agent | null): OnboardingTask => {
  return { name: Screens.Splash, completed: !!agent }
}

export const generateOnboardingWorkflowSteps = (
  state: State,
  config: Config,
  termsVersion: number,
  agent: Agent | null
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
  const { servedPenalty } = state.loginAttempt
  const { didAuthenticate } = state.authentication
  const { enableWalletNaming } = state.preferences
  const { showPreface, enablePushNotifications } = config

  return [
    isPrefaceComplete(didSeePreface, showPreface ?? false),
    isUpdateCheckComplete(),
    isOnboardingTutorialComplete(didCompleteTutorial),
    isTermsComplete(Number(didAgreeToTerms), termsVersion),
    isPINCreationComplete(didCreatePIN),
    isBiometryComplete(didConsiderBiometry),
    isPushNotificationComplete(didConsiderPushNotifications, enablePushNotifications),
    isNameWalletComplete(didNameWallet, enableWalletNaming),
    isAttemptLockoutComplete(servedPenalty),
    isAuthenticationComplete(didCreatePIN, didAuthenticate),
    isAgentInitializationComplete(agent),
  ]
}
