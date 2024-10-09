import {
  AgentProvider,
  AnimatedComponentsProvider,
  AuthProvider,
  ConfigurationProvider,
  ErrorModal,
  NetInfo,
  NetworkProvider,
  RootStack,
  StoreProvider,
  ThemeProvider,
  TourProvider,
  animatedComponents,
  credentialOfferTourSteps,
  credentialsTourSteps,
  defaultConfiguration,
  homeTourSteps,
  initLanguages,
  initStoredLanguage,
  proofRequestTourSteps,
  theme,
  toastConfig,
  translationResources,
} from '@hyperledger/aries-bifold-core'
import * as React from 'react'
import { useEffect, useMemo } from 'react'
import { StatusBar } from 'react-native'
import { isTablet } from 'react-native-device-info'
import Orientation from 'react-native-orientation-locker'
import SplashScreen from 'react-native-splash-screen'
import Toast from 'react-native-toast-message'

initLanguages(translationResources)

const App = () => {
  useMemo(() => {
    initStoredLanguage().then()
  }, [])

  useEffect(() => {
    // Hide the native splash / loading screen so that our
    // RN version can be displayed.
    SplashScreen.hide()
  }, [])

  if (!isTablet()) {
    Orientation.lockToPortrait()
  }

  return (
    <StoreProvider>
      <AgentProvider agent={undefined}>
        <ThemeProvider value={theme}>
          <AnimatedComponentsProvider value={animatedComponents}>
            <ConfigurationProvider value={defaultConfiguration}>
              <AuthProvider>
                <NetworkProvider>
                  <StatusBar
                    hidden={false}
                    barStyle="light-content"
                    backgroundColor={theme.ColorPallet.brand.primary}
                    translucent={false}
                  />
                  <NetInfo />
                  <ErrorModal />
                  <TourProvider
                    homeTourSteps={homeTourSteps}
                    credentialsTourSteps={credentialsTourSteps}
                    credentialOfferTourSteps={credentialOfferTourSteps}
                    proofRequestTourSteps={proofRequestTourSteps}
                    overlayColor={'gray'}
                    overlayOpacity={0.7}
                  >
                    <RootStack />
                  </TourProvider>
                  <Toast topOffset={15} config={toastConfig} />
                </NetworkProvider>
              </AuthProvider>
            </ConfigurationProvider>
          </AnimatedComponentsProvider>
        </ThemeProvider>
      </AgentProvider>
    </StoreProvider>
  )
}

export default App
