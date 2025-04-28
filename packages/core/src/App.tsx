import React, { useEffect } from 'react'
import { StatusBar } from 'react-native'
import SplashScreen from 'react-native-splash-screen'
import Toast from 'react-native-toast-message'

import { useNavigationContainerRef } from '@react-navigation/native'
import { isTablet } from 'react-native-device-info'
import Orientation from 'react-native-orientation-locker'
import { animatedComponents } from './animated-components'
import ErrorModal from './components/modals/ErrorModal'
import NetInfo from './components/network/NetInfo'
import toastConfig from './components/toast/ToastConfig'
import { tours } from './constants'
import { Container, ContainerProvider } from './container-api'
import { AnimatedComponentsProvider } from './contexts/animated-components'
import { AuthProvider } from './contexts/auth'
import NavContainer from './contexts/navigation'
import { NetworkProvider } from './contexts/network'
import { StoreProvider } from './contexts/store'
import { ThemeProvider } from './contexts/theme'
import { TourProvider } from './contexts/tour/tour-provider'
import { initStoredLanguage } from './localization'
import RootStack from './navigators/RootStack'
import { bifoldTheme, themes } from './theme'

const createApp = (container: Container): React.FC => {
  const AppComponent: React.FC = () => {
    const navigationRef = useNavigationContainerRef()

    useEffect(() => {
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
      <ContainerProvider value={container}>
        <StoreProvider>
          <ThemeProvider themes={themes} defaultThemeName={bifoldTheme.themeName}>
            <NavContainer navigationRef={navigationRef}>
              <AnimatedComponentsProvider value={animatedComponents}>
                <AuthProvider>
                  <NetworkProvider>
                    <StatusBar
                      hidden={false}
                      barStyle="light-content"
                      backgroundColor={bifoldTheme.ColorPallet.brand.primary}
                      translucent={false}
                    />
                    <NetInfo />
                    <ErrorModal />
                    <TourProvider tours={tours} overlayColor={'gray'} overlayOpacity={0.7}>
                      <RootStack />
                    </TourProvider>
                    <Toast topOffset={15} config={toastConfig} />
                  </NetworkProvider>
                </AuthProvider>
              </AnimatedComponentsProvider>
            </NavContainer>
          </ThemeProvider>
        </StoreProvider>
      </ContainerProvider>
    )
  }

  return AppComponent
}

export default createApp
