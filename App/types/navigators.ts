import { RequestedAttribute } from '@aries-framework/core'
import { NavigatorScreenParams } from '@react-navigation/core'

export enum Screens {
  Splash = 'Splash',
  Onboarding = 'Onboarding',
  Terms = 'Terms',
  CreatePin = 'Create 6-Digit Pin',
  EnterPin = 'Enter Pin',
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
  Connection = 'Connection',
  OnTheWay = 'On The Way',
  Declined = 'Declined',
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
  [Screens.Splash]: undefined
  [Screens.Onboarding]: undefined
  [Screens.Terms]: undefined
  [Screens.CreatePin]: { setAuthenticated: (auth: boolean) => void } | undefined
  [Screens.EnterPin]: { setAuthenticated: (auth: boolean) => void } | undefined
}

export type ContactStackParams = {
  [Screens.Contacts]: undefined
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
  [Screens.Scan]: undefined
}

export type SettingStackParams = {
  [Screens.Settings]: undefined
  [Screens.Language]: undefined
}

export type NotificationStackParams = {
  [Screens.CredentialOffer]: { credentialId: string }
  [Screens.ProofRequest]: { proofId: string }
  [Screens.ProofRequestAttributeDetails]: {
    proofId: string
    attributeName: string
    attributeCredentials: RequestedAttribute[]
  }
}

export type DeliveryStackParams = {
  [Screens.Connection]: { connectionId: string }
  [Screens.CredentialOffer]: { credentialId: string }
  [Screens.OnTheWay]: { credentialId: string }
  [Screens.Declined]: { credentialId: string }
}
