import {
	Agent,
	AgentProvider,
	ConfigurationContext,
	ConfigurationProvider,
	StoreProvider,
	ThemeProvider,
	theme,
	initLanguages,
	initStoredLanguage,
	translationResources,
	ErrorModal,
	toastConfig,
	RootStack,
	OnboardingPages,
	Splash,
	Terms,
} from 'aries-bifold'
import React, { useEffect, useState } from 'react'
import { StatusBar } from 'react-native'
import SplashScreen from 'react-native-splash-screen'
import Toast from 'react-native-toast-message'

const defaultConfiguration: ConfigurationContext = {
	pages: OnboardingPages,
	splash: Splash,
	terms: Terms,
}

initLanguages(translationResources)

const App = () => {
	initStoredLanguage()
	const [agent, setAgent] = useState<Agent | undefined>(undefined)

	useEffect(() => {
		// Hide the native splash / loading screen so that our
		// RN version can be displayed.
		SplashScreen.hide()
	}, [])

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
  );
};

export default App;
