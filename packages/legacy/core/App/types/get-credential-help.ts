import { StackNavigationProp } from '@react-navigation/stack'

import { NotificationStackParams, Screens } from './navigators'

export type GetCredentialHelpAction = (
  navigation: StackNavigationProp<NotificationStackParams, Screens.ProofRequest>
) => void

export interface GetCredentialHelpEntry {
  credDefIds: string[]
  schemaIds: string[]
  action: GetCredentialHelpAction
}
