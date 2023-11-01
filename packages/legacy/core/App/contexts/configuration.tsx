import { IndyVdrPoolConfig } from '@aries-framework/indy-vdr'
import { OCABundleResolverType } from '@hyperledger/aries-oca/build/legacy'
import { createContext, ReducerAction, useContext } from 'react'

import { ProofRequestTemplate } from '../../verifier'
import { EmptyListProps } from '../components/misc/EmptyList'
import { RecordProps } from '../components/record/Record'
import OnboardingPages from '../screens/OnboardingPages'
import { ScanProps } from '../screens/Scan'
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
  preface: React.FC
  homeHeaderView: React.FC
  homeFooterView: React.FC
  credentialListHeaderRight: React.FC
  credentialListOptions: React.FC
  credentialEmptyList: React.FC<EmptyListProps>
  developer: React.FC
  OCABundleResolver: OCABundleResolverType
  scan: React.FC<ScanProps>
  useBiometry: React.FC
  record: React.FC<RecordProps>
  PINSecurity: PINSecurityParams
  indyLedgers: IndyVdrPoolConfig[]
  settings: SettingSection[]
  customNotification: NotificationConfiguration
  useCustomNotifications: () => { total: number; notifications: any }
  connectionTimerDelay?: number
  autoRedirectConnectionToHome?: boolean
  proofRequestTemplates?: (useDevTemplates: boolean) => Array<ProofRequestTemplate>
  enableTours?: boolean
  enableImplicitInvitations?: boolean
  enableReuseConnections?: boolean
  showPreface?: boolean
}

export const ConfigurationContext = createContext<ConfigurationContext>(null as unknown as ConfigurationContext)

export const ConfigurationProvider = ConfigurationContext.Provider

export const useConfiguration = () => useContext(ConfigurationContext)
