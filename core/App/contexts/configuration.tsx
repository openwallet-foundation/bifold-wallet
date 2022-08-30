import { createContext, useContext } from 'react'

import OnboardingPages from '../screens/OnboardingPages'
import { Overlay } from '../types/overlay'

export interface ConfigurationContext {
  pages: typeof OnboardingPages
  splash: React.FC
  terms: React.FC
  homeContentView: React.FC
  OCABundle: Record<string, Overlay>
  useBiometry: React.FC
}

export const ConfigurationContext = createContext<ConfigurationContext>(null as unknown as ConfigurationContext)

export const ConfigurationProvider = ConfigurationContext.Provider

export const useConfiguration = () => useContext(ConfigurationContext)
