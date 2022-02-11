export interface Onboarding {
  DidCompleteTutorial: boolean
  DidAgreeToTerms: boolean
  DidCreatePIN: boolean
}

export interface Notifications {
  ConnectionPending: boolean
  ConnectionEstablished: boolean
}

export interface State {
  onboarding: Onboarding
  notifications: Notifications
  error: Error | null
}
