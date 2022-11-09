import { NavigatorScreenParams } from '@react-navigation/core'

import { DeclineType } from './decline'

export enum Screens {
  AttemptLockout = 'Temporarily Locked',
  Splash = 'Splash',
  Onboarding = 'Onboarding',
  Terms = 'Terms',
  CreatePin = 'Create a PIN',
  EnterPin = 'Enter PIN',
  Home = 'Home',
  Scan = 'Scan',
  Credentials = 'Credentials',
  CredentialDetails = 'Credential Details',
  Notifications = 'Notifications',
  CredentialOffer = 'Credential Offer',
  ProofRequest = 'Proof Request',
  ProofRequestAttributeDetails = 'Proof Request Attribute Details',
  Settings = 'Settings',
  Language = 'Language',
  Contacts = 'Contacts',
  ContactDetails = 'Contact Details',
  Chat = 'Chat',
  Connection = 'Connection',
  OnTheWay = 'On The Way',
  Declined = 'Declined',
  CommonDecline = 'Common Decline',
  UseBiometry = 'Use Biometry',
  RecreatePin = 'Change PIN',
  Developer = 'Developer',
}

export enum Stacks {
  TabStack = 'Tab Stack',
  HomeStack = 'Home Stack',
  ConnectStack = 'Connect Stack',
  CredentialStack = 'Credentials Stack',
  SettingStack = 'Settings Stack',
  ContactStack = 'Contacts Stack',
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
  [Screens.CreatePin]: { setAuthenticated: (status: boolean) => void } | undefined
  [Screens.EnterPin]: { setAuthenticated: (status: boolean) => void } | undefined
  [Screens.UseBiometry]: undefined
}

export type ContactStackParams = {
  [Screens.Contacts]: undefined
  [Screens.Chat]: { connectionId: string }
  [Screens.ContactDetails]: { connectionId: string }
}

export type CredentialStackParams = {
  [Screens.Credentials]: undefined
  [Screens.CredentialDetails]: { credentialId: string }
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
  [Screens.UseBiometry]: undefined
  [Screens.CreatePin]: undefined
  [Screens.RecreatePin]: undefined
  [Screens.Terms]: undefined
  [Screens.Onboarding]: undefined
  [Screens.Developer]: undefined
}

export type NotificationStackParams = {
  [Screens.CredentialOffer]: { credentialId: string }
  [Screens.ProofRequest]: { proofId: string }
  [Screens.ProofRequestAttributeDetails]: {
    proofId: string
    attributeName: string | null
  }
  [Screens.CommonDecline]: {
    declineType: DeclineType
    itemId: string
  }
}

export type DeliveryStackParams = {
  [Screens.Connection]: { connectionId?: string; threadId?: string }
  [Screens.CredentialOffer]: { credentialId: string }
  [Screens.ProofRequest]: { proofId: string }
  [Screens.ProofRequestAttributeDetails]: {
    proofId: string
    attributeName: string | null
  }
  [Screens.CommonDecline]: {
    declineType: DeclineType
    itemId: string
  }
  [Screens.OnTheWay]: { credentialId: string }
  [Screens.Declined]: { credentialId: string }
}
