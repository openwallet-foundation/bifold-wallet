import { RequestedAttribute } from '@aries-framework/core'
import { NavigatorScreenParams } from '@react-navigation/core'

export enum Screens {
  Tabs = 'Tabs',
  Connect = 'Connect',
  Onboarding = 'Onboarding',
  Terms = 'Terms',
  CreatePin = 'Create 6-Digit Pin',
  Splash = 'Splash',
  EnterPin = 'Enter Pin',
  Contacts = 'Contacts',
  ContactDetails = 'Contact Details',
  Credentials = 'Credentials',
  CredentialDetails = 'Credential Details',
  Home = 'Home',
  Notifications = 'Notifications',
  CredentialOffer = 'Credential Offer',
  ProofRequest = 'Proof Request',
  ProofRequestAttributeDetails = 'Proof Request Attribute Details',
  Scan = 'Scan',
  Settings = 'Settings',
  Language = 'Language',
}

export enum Stacks {
  HomeStack = 'Home Stack',
  ScanStack = 'Scan Stack',
  CredentialStack = 'Credentials Stack',
  SettingStack = 'Settings Stack',
  ContactStack = 'Contacts Stack',
}

export type TabStackParams = {
  [Stacks.HomeStack]: NavigatorScreenParams<HomeStackParams>
  [Stacks.ScanStack]: NavigatorScreenParams<ScanStackParams>
  [Stacks.CredentialStack]: NavigatorScreenParams<CredentialStackParams>
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
  [Screens.CredentialOffer]: { credentialId: string }
  [Screens.ProofRequest]: { proofId: string }
  [Screens.ProofRequestAttributeDetails]: {
    proofId: string
    attributeName: string
    attributeCredentials: RequestedAttribute[]
  }
}

export type ScanStackParams = {
  [Screens.Scan]: undefined
}

export type SettingStackParams = {
  [Screens.Settings]: undefined
  [Screens.Language]: undefined
}
