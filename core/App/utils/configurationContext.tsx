import { createContext, useContext } from 'react'

import { pages } from '../screens/OnboardingPages'

export interface ConfigurationContext {
  onboarding: {
    pages: typeof pages
  }
  splash: React.FC
  terms: React.FC
}

const ConfigurationContext = createContext<ConfigurationContext>(null as unknown as ConfigurationContext)
export const ConfigurationProvider = ConfigurationContext.Provider

export const useConfigurationContext = () => useContext(ConfigurationContext)
