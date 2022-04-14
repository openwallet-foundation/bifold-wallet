import { createContext, useContext, FC } from 'react'

import { pages } from '../screens/OnboardingPages'

export interface ConfigurationContext {
  onboarding: {
    pages: typeof pages
  }
  splash: FC
  terms: FC
}

const ConfigurationContext = createContext<ConfigurationContext>(null as unknown as ConfigurationContext)
export const ConfigurationProvider = ConfigurationContext.Provider

export const useConfigurationContext = () => useContext(ConfigurationContext)
