import { NavigatorScreenParams } from '@react-navigation/core'

import { DeclineType } from './decline'

export enum Screens {
  Splash = 'Splash',
  Onboarding = 'Onboarding',
  Privacy = 'Privacy',
  Terms = 'Terms',
  NameCreate = 'Display Name',
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
  NameUpdate = 'Update Name',
  Language = 'Language',
  Connect = 'Connect',
  DisplayCode = 'Display Code',
  Contacts = 'Contacts',
  ContactDetails = 'Contact Details',
  Chat = 'Chat',
  Connection = 'Connection',
  OnTheWay = 'On The Way',
  Declined = 'Declined',
  CommonDecline = 'CommonDecline',
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
  ContactStack = 'Tab Contact Stack',
  SettingStack = 'Tab Setting Stack',
}

export type RootStackParams = {
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
  [TabStacks.ContactStack]: NavigatorScreenParams<ContactStackParams>
  [TabStacks.SettingStack]: NavigatorScreenParams<SettingStackParams>
}

export type AuthenticateStackParams = {
  [Screens.Splash]: undefined
  [Screens.Onboarding]: undefined
  [Screens.Privacy]: undefined
  [Screens.Terms]: undefined
  [Screens.NameCreate]: undefined
  [Screens.CreatePin]: undefined
  [Screens.EnterPin]: undefined
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
  [Screens.ProofRequestAttributeDetails]: { proofId: string; attributeName: string }
}

export type ConnectStackParams = {
  [Screens.Connect]: undefined
  [Screens.Scan]: undefined
  [Screens.DisplayCode]: undefined
}

export type SettingStackParams = {
  [Screens.Settings]: undefined
  [Screens.NameUpdate]: undefined
  [Screens.Language]: undefined
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
  [Screens.ProofRequestAttributeDetails]: undefined
  [Screens.OnTheWay]: { credentialId: string }
  [Screens.Declined]: { credentialId: string }
  [Screens.CommonDecline]: {
    declineType: DeclineType
    itemId: string
  }
}
