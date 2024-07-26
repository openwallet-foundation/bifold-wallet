import { StackNavigationOptions } from '@react-navigation/stack'
import { ReducerAction } from 'react'

export interface CustomNotification {
  component: React.FC
  onCloseAction: (dispatch?: React.Dispatch<ReducerAction<any>>) => void
  title: string
  description: string
  buttonTitle: string
  pageTitle: string
  additionalStackItems?: [
    {
      component: React.FC
      name: string
      stackOptions?: StackNavigationOptions
    }
  ]
}
