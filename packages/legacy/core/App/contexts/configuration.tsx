import { Agent } from '@credo-ts/core'
import { StackNavigationOptions, StackScreenProps } from '@react-navigation/stack'
import { createContext, useContext } from 'react'

import { EmptyListProps } from '../components/misc/EmptyList'
import { RecordProps } from '../components/record/Record'
import { Locales } from '../localization'
import OnboardingPages from '../screens/OnboardingPages'
import { ConnectStackParams } from '../types/navigators'
import { PINSecurityParams } from '../types/security'
import { SettingSection } from '../types/settings'

interface PushNotificationConfiguration {
  // function to get the current push notification permission status
  status: () => Promise<'denied' | 'granted' | 'unknown'>
  // function to request permission for push notifications
  setup: () => Promise<'denied' | 'granted' | 'unknown'>
  //function to call when the user changes the push notification setting
  toggle: (state: boolean, agent: Agent<any>) => Promise<void>
}

export interface ConfigurationContext {
  pages: typeof OnboardingPages
  splash: React.FC
  terms: React.FC
  preface: React.FC
  homeHeaderView: React.FC
  homeFooterView: React.FC
  credentialListHeaderRight: React.FC
  credentialListOptions: React.FC
  credentialEmptyList: React.FC<EmptyListProps>
  developer: React.FC
  proofTemplateBaseUrl?: string
  scan: React.FC<StackScreenProps<ConnectStackParams>>
  record: React.FC<RecordProps>
  PINSecurity: PINSecurityParams
  settings: SettingSection[]
  supportedLanguages: Locales[]
  connectionTimerDelay?: number
  autoRedirectConnectionToHome?: boolean
  enableTours?: boolean
  enableImplicitInvitations?: boolean
  enableReuseConnections?: boolean
  showPreface?: boolean
  disableOnboardingSkip?: boolean
  useBiometry: React.FC
  enablePushNotifications?: PushNotificationConfiguration
  whereToUseWalletUrl: string
  showScanHelp?: boolean
  showScanButton?: boolean
  globalScreenOptions?: StackNavigationOptions
  showDetailsInfo?: boolean
  contactHideList?: string[]
  credentialHideList?: string[]
}

export const ConfigurationContext = createContext<ConfigurationContext>(null as unknown as ConfigurationContext)

export const ConfigurationProvider = ConfigurationContext.Provider

export const useConfiguration = () => useContext(ConfigurationContext)
