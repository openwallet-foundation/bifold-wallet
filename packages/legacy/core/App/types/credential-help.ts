import { StackNavigationProp } from '@react-navigation/stack'

import { NotificationStackParams, Screens } from './navigators'

export type CredentialHelpAction = (
  navigation: StackNavigationProp<NotificationStackParams, Screens.ProofRequest>
) => void

export interface CredentialHelpEntry {
  credDefIds: string[]
  action: CredentialHelpAction
}
