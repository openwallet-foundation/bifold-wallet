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
import { Container, ContainerProvider } from './container-api'
import { ActivityProvider } from './contexts/activity'
import { AnimatedComponentsProvider } from './contexts/animated-components'
import { AuthProvider } from './contexts/auth'
import { NetworkProvider } from './contexts/network'
import { StoreProvider } from './contexts/store'
import { ThemeProvider } from './contexts/theme'
import { TourProvider } from './contexts/tour/tour-provider'
import { initLanguages, initStoredLanguage, translationResources } from './localization'
import RootStack from './navigators/RootStack'
import { theme } from './theme'
import { OpenIDCredentialRecordProvider } from './modules/openid/context/OpenIDCredentialRecordProvider'
import { tours } from './constants'

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
            <OpenIDCredentialRecordProvider>
              <ThemeProvider value={theme}>
                <AnimatedComponentsProvider value={animatedComponents}>
                  <AuthProvider>
                    <NetworkProvider>
                      <ActivityProvider>
                        <StatusBar
                          hidden={false}
                          barStyle="light-content"
                          backgroundColor={theme.ColorPallet.brand.primary}
                          translucent={false}
                        />
                        <NetInfo />
                        <ErrorModal />
                        <TourProvider tours={tours} overlayColor={'gray'} overlayOpacity={0.7}>
                          <RootStack />
                        </TourProvider>
                        <Toast topOffset={15} config={toastConfig} />
                      </ActivityProvider>
                    </NetworkProvider>
                  </AuthProvider>
                </AnimatedComponentsProvider>
              </ThemeProvider>
            </OpenIDCredentialRecordProvider>
          </AgentProvider>
        </StoreProvider>
      </ContainerProvider>
    )
  }

  return AppComponent
}
export default App
