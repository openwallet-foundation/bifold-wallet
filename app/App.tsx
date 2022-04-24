import {
  Agent,
  AgentProvider,
  toastConfig,
  initStoredLanguage,
  RootStack,
  ErrorModal,
  StoreProvider,
  ThemeProvider,
  defaultTheme as theme,
  ConfigurationContext,
  ConfigurationProvider,
  initLanguages,
  defaultTranslationResources,
  OnboardingPages,
  Splash,
  Terms
} from 'aries-bifold'
import React, { useEffect, useState } from 'react'
import { StatusBar } from 'react-native'
import SplashScreen from 'react-native-splash-screen'
import Toast from 'react-native-toast-message'

const translationResources = defaultTranslationResources
initLanguages(translationResources)
const App = () => {
  const [agent, setAgent] = useState<Agent | undefined>(undefined)
  initStoredLanguage()

  useEffect(() => {
    // Hide the native splash / loading screen so that our
    // RN version can be displayed.
    SplashScreen.hide()
  }, [])
  const defaultConfiguration: ConfigurationContext = {
    pages: OnboardingPages,
    splash: Splash,
    terms: Terms,
  }
  return (
    <StoreProvider>
      <AgentProvider agent={agent}>
        <ThemeProvider value={theme}>
          <ConfigurationProvider value={defaultConfiguration}>
            <StatusBar
              barStyle="light-content"
              hidden={false}
              backgroundColor={theme.ColorPallet.brand.primary}
              translucent={false}
            />
            <ErrorModal />
            <RootStack setAgent={setAgent} />
            <Toast topOffset={15} config={toastConfig} />
          </ConfigurationProvider>
        </ThemeProvider>
      </AgentProvider>
    </StoreProvider>
  )
}

export default App
