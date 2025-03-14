import { MdocRecord, SdJwtVcRecord, W3cCredentialRecord } from '@credo-ts/core'
import { NavigatorScreenParams } from '@react-navigation/native'
import { StackNavigationOptions } from '@react-navigation/stack'
import { OpenId4VPRequestRecord, OpenIDCredentialType } from '../modules/openid/types'
import { LayoutProps } from '../layout/ScreenLayout'

export enum Screens {
  AttemptLockout = 'Temporarily Locked',
  Splash = 'Splash',
  Onboarding = 'Onboarding',
  Terms = 'Terms',
  Preface = 'Preface',
  CreatePIN = 'Create a PIN',
  EnterPIN = 'Enter PIN',
  Home = 'Home',
  Scan = 'Scan',
  PasteUrl = 'Paste URL',
  Credentials = 'Credentials',
  CredentialDetails = 'Credential Details',
  CredentialOffer = 'Credential Offer',
  OpenIDCredentialDetails = 'Open ID Credential details',
  OpenIDCredentialOffer = 'Open ID Credential offer',
  OpenIDProofPresentation = 'Open ID Proof Presentation',
  ProofRequest = 'Proof Request',
  ProofRequestDetails = 'Proof Request Details',
  ProofRequestUsageHistory = 'Proof Request Usage History',
  Settings = 'Settings',
  Language = 'Language',
  DataRetention = 'Data Retention',
  Tours = 'Tours',
  Contacts = 'Contacts',
  ContactDetails = 'Contact Details',
  WhatAreContacts = 'What Are Contacts',
  Chat = 'Chat',
  Connection = 'Connection',
  MobileVerifierLoading = 'Mobile Verifier Loading',
  OnTheWay = 'On The Way',
  Declined = 'Declined',
  UseBiometry = 'Use Biometry',
  UsePushNotifications = 'Use Push Notifications',
  Developer = 'Developer',
  CustomNotification = 'Custom Notification',
  ProofChangeCredential = 'Choose a credential',
  ProofRequests = 'Proof Requests',
  ProofRequesting = 'Proof Requesting',
  ProofDetails = 'Proof Details',
  NameWallet = 'Name Wallet',
  RenameContact = 'Rename Contact',
  ScanHelp = 'Scan Help',
  HistorySettings = 'History Settings',
  HistoryPage = 'History',
  HistoryDetails = 'History details',
  AutoLock = 'AutoLock',
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
  HistoryStack = 'History Stack',
  CustomNavStack1 = 'Custom Nav Stack 1',
}

export enum TabStacks {
  HomeStack = 'Tab Home Stack',
  ConnectStack = 'Tab Connect Stack',
  CredentialStack = 'Tab Credential Stack',
}

export type RootStackParams = {
  [Screens.Splash]: undefined
  [Stacks.TabStack]: NavigatorScreenParams<TabStackParams>
  [Screens.Chat]: { connectionId: string }
  [Stacks.ConnectStack]: NavigatorScreenParams<ConnectStackParams>
  [Stacks.SettingStack]: NavigatorScreenParams<SettingStackParams>
  [Stacks.ContactStack]: NavigatorScreenParams<ContactStackParams>
  [Stacks.ProofRequestsStack]: NavigatorScreenParams<ProofRequestsStackParams>
  [Stacks.NotificationStack]: NavigatorScreenParams<NotificationStackParams>
  [Stacks.HistoryStack]: NavigatorScreenParams<HistoryStackParams>
  [Screens.CredentialDetails]: { credentialId: string }
  [Screens.OpenIDCredentialDetails]: { credentialId: string; type: OpenIDCredentialType }
  [Stacks.CustomNavStack1]: undefined
}

export type TabStackParams = {
  [TabStacks.HomeStack]: NavigatorScreenParams<HomeStackParams>
  [TabStacks.ConnectStack]: NavigatorScreenParams<ConnectStackParams>
  [TabStacks.CredentialStack]: NavigatorScreenParams<CredentialStackParams>
}

export type AuthenticateStackParams = {
  [Screens.Preface]: undefined
  [Screens.Onboarding]: undefined
  [Screens.Terms]: undefined
  [Screens.AttemptLockout]: undefined
  [Screens.CreatePIN]: { setAuthenticated: (status: boolean) => void } | undefined
  [Screens.EnterPIN]: { setAuthenticated: (status: boolean) => void } | undefined
  [Screens.UseBiometry]: undefined
  [Screens.NameWallet]: undefined
  [Screens.UsePushNotifications]: undefined
}

export type OnboardingStackParams = {
  [Screens.Onboarding]: undefined
  [Screens.Developer]: undefined
}

export type ContactStackParams = {
  [Screens.Contacts]: undefined
  [Screens.Chat]: { connectionId: string }
  [Screens.ContactDetails]: { connectionId: string }
  [Screens.RenameContact]: { connectionId: string }
  [Screens.WhatAreContacts]: undefined
  [Screens.CredentialDetails]: { credentialId: string }
  [Screens.CredentialOffer]: { credentialId: string }
  [Screens.ProofDetails]: { recordId: string; isHistory?: boolean }
  [Screens.ProofRequest]: { proofId: string }
}

export type ProofRequestsStackParams = {
  [Screens.ProofRequests]: { connectionId?: string }
  [Screens.ProofRequesting]: { templateId: string; predicateValues?: Record<string, Record<string, number>> }
  [Screens.ProofDetails]: { recordId: string; isHistory?: boolean; senderReview?: boolean }
  [Screens.ProofRequestDetails]: { templateId: string; connectionId?: string }
  [Screens.MobileVerifierLoading]: { proofId: string; connectionId: string }
  [Screens.ProofRequestUsageHistory]: { templateId: string }
  [Screens.ProofChangeCredential]: {
    selectedCred: string
    altCredentials: string[]
    proofId: string
    onCredChange: (arg: string) => void
  }
}

export type CredentialStackParams = {
  [Screens.Credentials]: undefined
}

export type HomeStackParams = {
  [Screens.Home]: undefined
}

export type ConnectStackParams = {
  [Screens.Scan]: undefined
  [Screens.NameWallet]: undefined
  [Screens.ScanHelp]: undefined
  [Screens.PasteUrl]: undefined
}

export type SettingStackParams = {
  [Screens.NameWallet]: undefined
  [Screens.Settings]: undefined
  [Screens.Language]: undefined
  [Screens.DataRetention]: undefined
  [Screens.Tours]: undefined
  [Screens.UseBiometry]: undefined
  [Screens.CreatePIN]: undefined
  [Screens.Terms]: undefined
  [Screens.Onboarding]: undefined
  [Screens.Developer]: undefined
  [Screens.UsePushNotifications]: { isMenu?: boolean }
  [Screens.HistorySettings]: undefined
  [Screens.AutoLock]: undefined
}

export type NotificationStackParams = {
  [Screens.CredentialDetails]: { credentialId: string }
  [Screens.OpenIDCredentialDetails]: {
    credential: SdJwtVcRecord | W3cCredentialRecord
  }
  [Screens.CredentialOffer]: { credentialId: string }
  [Screens.ProofRequest]: { proofId: string }
  [Screens.CustomNotification]: undefined
  [Screens.ProofDetails]: { recordId: string }
}

export type DeliveryStackParams = {
  [Screens.Connection]: {
    oobRecordId?: string
    proofId?: string
    credentialId?: string
    openIDUri?: string
    openIDPresentationUri?: string
  }
  [Screens.MobileVerifierLoading]: { proofId: string; connectionId: string }
  [Screens.ProofDetails]: { recordId: string }
  [Screens.CredentialOffer]: { credentialId: string }
  [Screens.ProofRequest]: { proofId: string }
  [Screens.OnTheWay]: { credentialId: string }
  [Screens.Declined]: { credentialId: string }
  [Screens.Chat]: { connectionId: string }
  [Screens.OpenIDCredentialOffer]: {
    credential: SdJwtVcRecord | W3cCredentialRecord | MdocRecord
  }
  [Screens.OpenIDProofPresentation]: { credential: OpenId4VPRequestRecord }
}

export type HistoryStackParams = {
  [Screens.HistoryPage]: undefined
}

export type ScreenLayoutConfig = Partial<Record<Screens, LayoutProps>>
export type ScreenOptionsType = Partial<Record<Screens, StackNavigationOptions>>
