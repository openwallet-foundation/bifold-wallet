import { CredentialExchangeRecord } from '@aries-framework/core'
import { NavigatorScreenParams } from '@react-navigation/core'

import { DeclineType } from './decline'
import { GenericFn } from './fn'

export enum Screens {
  AttemptLockout = 'Temporarily Locked',
  Splash = 'Splash',
  Onboarding = 'Onboarding',
  Terms = 'Terms',
  CreatePIN = 'Create a PIN',
  EnterPIN = 'Enter PIN',
  Home = 'Home',
  Scan = 'Scan',
  Credentials = 'Credentials',
  CredentialDetails = 'Credential Details',
  Notifications = 'Notifications',
  CredentialOffer = 'Credential Offer',
  ProofRequest = 'Proof Request',
  ProofRequestDetails = 'Proof Request Details',
  ProofRequestUsageHistory = 'Proof Request Usage History',
  Settings = 'Settings',
  Language = 'Language',
  Tours = 'Tours',
  Contacts = 'Contacts',
  ContactDetails = 'Contact Details',
  WhatAreContacts = 'What Are Contacts',
  Chat = 'Chat',
  Connection = 'Connection',
  OnTheWay = 'On The Way',
  Declined = 'Declined',
  CommonDecline = 'Common Decline',
  UseBiometry = 'Use Biometry',
  RecreatePIN = 'Change PIN',
  Developer = 'Developer',
  CustomNotification = 'Custom Notification',
  ProofRequests = 'Proof Requests',
  ProofRequesting = 'Proof Requesting',
  ProofDetails = 'Proof Details',
  ConnectionInvitation = 'Connection Invitation',
}

export enum Stacks {
  TabStack = 'Tab Stack',
  HomeStack = 'Home Stack',
  ConnectStack = 'Connect Stack',
  CredentialStack = 'Credentials Stack',
  SettingStack = 'Settings Stack',
  ContactStack = 'Contacts Stack',
  ProofRequestsStack = 'Proof Requests Stack',
  NotificationStack = 'Notifications Stack',
  ConnectionStack = 'Connection Stack',
}

export enum TabStacks {
  HomeStack = 'Tab Home Stack',
  ConnectStack = 'Tab Connect Stack',
  CredentialStack = 'Tab Credential Stack',
}

export type RootStackParams = {
  [Screens.Splash]: undefined
  [Stacks.TabStack]: NavigatorScreenParams<TabStackParams>
  [Stacks.ConnectStack]: NavigatorScreenParams<ConnectStackParams>
  [Stacks.SettingStack]: NavigatorScreenParams<SettingStackParams>
  [Stacks.ContactStack]: NavigatorScreenParams<ContactStackParams>
  [Stacks.ProofRequestsStack]: NavigatorScreenParams<ProofRequestsStackParams>
  [Stacks.NotificationStack]: NavigatorScreenParams<NotificationStackParams>
}

export type TabStackParams = {
  [TabStacks.HomeStack]: NavigatorScreenParams<HomeStackParams>
  [TabStacks.ConnectStack]: NavigatorScreenParams<ConnectStackParams>
  [TabStacks.CredentialStack]: NavigatorScreenParams<CredentialStackParams>
}

export type AuthenticateStackParams = {
  [Screens.Onboarding]: undefined
  [Screens.Terms]: undefined
  [Screens.AttemptLockout]: undefined
  [Screens.CreatePIN]: { setAuthenticated: (status: boolean) => void } | undefined
  [Screens.EnterPIN]: { setAuthenticated: (status: boolean) => void } | undefined
  [Screens.UseBiometry]: undefined
}

export type ContactStackParams = {
  [Screens.ConnectionInvitation]: undefined
  [Screens.Contacts]: undefined
  [Screens.Chat]: { connectionId: string }
  [Screens.ContactDetails]: { connectionId: string }
  [Screens.WhatAreContacts]: undefined
  [Screens.CredentialDetails]: { credentialId: string }
  [Screens.ProofDetails]: { recordId: string; isHistory?: boolean }
}

export type ProofRequestsStackParams = {
  [Screens.ProofRequests]: { connectionId?: string }
  [Screens.ProofRequesting]: { templateId: string; predicateValues?: Record<string, Record<string, number>> }
  [Screens.ProofDetails]: { recordId: string; isHistory?: boolean }
  [Screens.ProofRequestDetails]: { templateId: string; connectionId?: string }
  [Screens.ProofRequestUsageHistory]: { templateId: string }
}

export type CredentialStackParams = {
  [Screens.Credentials]: undefined
  [Screens.CredentialDetails]: { credential: CredentialExchangeRecord }
}

export type HomeStackParams = {
  [Screens.Home]: undefined
  [Screens.Notifications]: undefined
}

export type ConnectStackParams = {
  [Screens.Scan]: undefined
}

export type SettingStackParams = {
  [Screens.Settings]: undefined
  [Screens.Language]: undefined
  [Screens.Tours]: undefined
  [Screens.UseBiometry]: undefined
  [Screens.CreatePIN]: undefined
  [Screens.RecreatePIN]: undefined
  [Screens.Terms]: undefined
  [Screens.Onboarding]: undefined
  [Screens.Developer]: undefined
}

export type NotificationStackParams = {
  [Screens.CredentialDetails]: { credentialId: string }
  [Screens.CredentialOffer]: { credentialId: string }
  [Screens.ProofRequest]: { proofId: string }
  [Screens.CommonDecline]: {
    declineType: DeclineType
    itemId: string
    deleteView?: boolean
    customClose?: GenericFn
  }
  [Screens.CustomNotification]: undefined
  [Screens.ProofDetails]: { recordId: string }
}

export type DeliveryStackParams = {
  [Screens.Connection]: { connectionId?: string; threadId?: string }
  [Screens.CredentialOffer]: { credentialId: string }
  [Screens.ProofRequest]: { proofId: string }
  [Screens.CommonDecline]: {
    declineType: DeclineType
    itemId: string
  }
  [Screens.OnTheWay]: { credentialId: string }
  [Screens.Declined]: { credentialId: string }
}
