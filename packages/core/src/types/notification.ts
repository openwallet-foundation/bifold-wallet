import React from 'react'
import { StackNavigationOptions } from '@react-navigation/stack'

export interface CustomNotification {
  component: React.FC
  onCloseAction: (dispatch?: React.Dispatch<any>) => void
  title: string
  description: string
  buttonTitle: string
  pageTitle: string
  type?: string
  createdAt?: Date
  onPressAction?: () => void
  additionalStackItems?: [
    {
      component: React.FC
      name: string
      stackOptions?: StackNavigationOptions
    },
  ]
  metadata?: Record<string, unknown>
}

export interface CustomNotificationRecord {
  type: 'CustomNotification'
  createdAt: Date
  id: string
}
