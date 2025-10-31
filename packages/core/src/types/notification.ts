import { StackNavigationOptions } from '@react-navigation/stack'
import { ReducerAction } from 'react'

export interface CustomNotification {
  component: React.FC
  onCloseAction: (dispatch?: React.Dispatch<ReducerAction<any>>) => void
  title: string
  description: string
  buttonTitle: string
  pageTitle: string
  //TODO: to be refactored later in a notifications specific PR
  type?: string
  createdAt?: Date
  onPressAction?: () => void
  additionalStackItems?: [
    {
      component: React.FC
      name: string
      stackOptions?: StackNavigationOptions
    }
  ]
  metadata?: Record<string, unknown>
}

export interface CustomNotificationRecord {
  type: 'CustomNotification'
  createdAt: Date
  id: string
}
