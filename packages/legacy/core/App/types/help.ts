import { StackNavigationProp } from '@react-navigation/stack'

import { NotificationStackParams, Screens } from './navigators'

export type HelpAction = (navigation: StackNavigationProp<NotificationStackParams, Screens.ProofRequest>) => void

export interface HelpEntry {
  credDefIds: string[]
  action: HelpAction
}
