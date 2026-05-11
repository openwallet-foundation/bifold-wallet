import React from 'react'
import { StackNavigationOptions } from '@react-navigation/stack'
import { ClaimFormat } from '@credo-ts/core'
import { W3cCredentialDisplay } from '../modules/openid/types'

export interface CustomNotification {
  type?: string
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
    oldId: string,
    replacementId?: string,
    credential?: {
      name?: string,
      logo?: string,
      primaryBackgroundColor?: string,
      secondaryBackgroundColor?: string
    },
    format?: ClaimFormat
  }
}

export interface CustomNotificationRecord {
  type: 'CustomNotification'
  createdAt: Date
  id: string
}
