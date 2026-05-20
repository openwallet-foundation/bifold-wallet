import React from 'react'
import { StackNavigationOptions } from '@react-navigation/stack'

import { OpenIDCustomNotificationType } from '../modules/openid/refresh/types'

export interface CustomNotification {
  component: React.FC
  pageTitle: string
  type?: OpenIDCustomNotificationType
  createdAt?: Date
  onPressAction?: () => void
  onCloseAction?: () => void
  additionalStackItems?: [
    {
      component: React.FC
      name: string
      stackOptions?: StackNavigationOptions
    },
  ]
  metadata?: {
    oldId?: string,
    replacementId?: string,
  }
}

export interface CustomNotificationRecord {
  type: 'CustomNotification'
  createdAt: Date
  id: string
}
