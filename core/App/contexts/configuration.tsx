import { IndyPoolConfig } from '@aries-framework/core'
import { createContext, useContext } from 'react'

import { RecordProps } from '../components/record/Record'
import OnboardingPages from '../screens/OnboardingPages'
import { ScanProps } from '../screens/Scan'
import { OCABundleResolver } from '../types/oca'
import { PINSecurityParams } from '../types/security'
import { SettingSection } from '../types/settings'

export interface ConfigurationContext {
  pages: typeof OnboardingPages
  splash: React.FC
  terms: React.FC
  homeContentView: React.FC
  developer: React.FC
  OCABundle: OCABundleResolver
  scan: React.FC<ScanProps>
  useBiometry: React.FC
  record: React.FC<RecordProps>
  PINSecurity: PINSecurityParams
  indyLedgers: IndyPoolConfig[]
  settings: SettingSection[]
}

export const ConfigurationContext = createContext<ConfigurationContext>(null as unknown as ConfigurationContext)

export const ConfigurationProvider = ConfigurationContext.Provider

export const useConfiguration = () => useContext(ConfigurationContext)
