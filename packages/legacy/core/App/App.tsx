import AgentProvider from '@credo-ts/react-hooks'
import * as React from 'react'
import { useEffect, useMemo } from 'react'
import { StatusBar } from 'react-native'
import SplashScreen from 'react-native-splash-screen'
import Toast from 'react-native-toast-message'

import { animatedComponents } from './animated-components'
import ErrorModal from './components/modals/ErrorModal'
import NetInfo from './components/network/NetInfo'
import toastConfig from './components/toast/ToastConfig'
import { credentialOfferTourSteps } from './components/tour/CredentialOfferTourSteps'
import { credentialsTourSteps } from './components/tour/CredentialsTourSteps'
import { homeTourSteps } from './components/tour/HomeTourSteps'
import { proofRequestTourSteps } from './components/tour/ProofRequestTourSteps'
import { Container, ContainerProvider } from './container-api'
import { AnimatedComponentsProvider } from './contexts/animated-components'
import { AuthProvider } from './contexts/auth'
import { NetworkProvider } from './contexts/network'
import { StoreProvider } from './contexts/store'
import { ThemeProvider } from './contexts/theme'
import { TourProvider } from './contexts/tour/tour-provider'
import { initLanguages, initStoredLanguage, translationResources } from './localization'
import RootStack from './navigators/RootStack'
import { theme } from './theme'

const App = (system: Container): React.FC => {
  initLanguages(translationResources)

  const AppComponent = () => {
    useMemo(() => {
      initStoredLanguage().then()
    }, [])

    useEffect(() => {
      // Hide the native splash / loading screen so that our
      // RN version can be displayed.
      SplashScreen.hide()
    }, [])

    return (
      <ContainerProvider value={system}>
        <StoreProvider>
          <AgentProvider agent={undefined}>
            <ThemeProvider value={theme}>
              <AnimatedComponentsProvider value={animatedComponents}>
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
              </AnimatedComponentsProvider>
            </ThemeProvider>
          </AgentProvider>
        </StoreProvider>
      </ContainerProvider>
    )
  }

  return AppComponent
}
export default App
