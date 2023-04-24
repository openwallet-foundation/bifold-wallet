import { IndyPoolConfig } from '@aries-framework/core'
import { createContext, ReducerAction, useContext } from 'react'

import { ProofRequestTemplate } from '../../verifier'
import { EmptyListProps } from '../components/misc/EmptyList'
import { RecordProps } from '../components/record/Record'
import OnboardingPages from '../screens/OnboardingPages'
import { ScanProps } from '../screens/Scan'
import { OCABundleResolver } from '../types/oca'
import { PINSecurityParams } from '../types/security'
import { SettingSection } from '../types/settings'

interface NotificationConfiguration {
  component: React.FC
  onCloseAction: (dispatch?: React.Dispatch<ReducerAction<any>>) => void
  title: string
  description: string
  buttonTitle: string
  pageTitle: string
}

export interface ConfigurationContext {
  pages: typeof OnboardingPages
  splash: React.FC
  terms: React.FC
  homeContentView: React.FC
  credentialListHeaderRight: React.FC
  credentialListOptions: React.FC
  credentialEmptyList: React.FC<EmptyListProps>
  developer: React.FC
  OCABundleResolver: OCABundleResolver
  scan: React.FC<ScanProps>
  useBiometry: React.FC
  record: React.FC<RecordProps>
  PINSecurity: PINSecurityParams
  indyLedgers: IndyPoolConfig[]
  settings: SettingSection[]
  customNotification: NotificationConfiguration
  useCustomNotifications: () => { total: number; notifications: any }
  connectionTimerDelay?: number
  autoRedirectConnectionToHome?: boolean
  proofRequestTemplates?: Array<ProofRequestTemplate>
  enableTours?: boolean
}

export const ConfigurationContext = createContext<ConfigurationContext>(null as unknown as ConfigurationContext)

export const ConfigurationProvider = ConfigurationContext.Provider

export const useConfiguration = () => useContext(ConfigurationContext)
