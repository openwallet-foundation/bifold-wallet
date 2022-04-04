import {
  Agent,
  AutoAcceptCredential,
  ConsoleLogger,
  HttpOutboundTransport,
  LogLevel,
  MediatorPickupStrategy,
  WsOutboundTransport,
} from '@aries-framework/core'
import AgentProvider from '@aries-framework/react-hooks'
import { agentDependencies } from '@aries-framework/react-native'
import { default as React, useEffect, useState } from 'react'
import { StatusBar } from 'react-native'
import Config from 'react-native-config'
import SplashScreen from 'react-native-splash-screen'
import Toast from 'react-native-toast-message'

import ConnectionModal from './App/components/modals/ConnectionModal'
import ErrorModal from './App/components/modals/ErrorModal'
import toastConfig from './App/components/toast/ToastConfig'
import { initLanguages, initStoredLanguage, defaultTranslationResources } from './App/localization'
import RootStack from './App/navigators/RootStack'
import StoreProvider from './App/store/Store'
import { defaultTheme as theme } from './App/theme'
import { ThemeProvider } from './App/utils/themeContext'
import indyLedgers from './configs/ledgers/indy'

initLanguages(defaultTranslationResources)

const App = () => {
  const [agent, setAgent] = useState<Agent | undefined>(undefined)

  initStoredLanguage()

  useEffect(() => {
    // Hide the native splash / loading screen so that our
    // RN version can be displayed.
    SplashScreen.hide()
  }, [])

  return (
    <StoreProvider>
      <AgentProvider agent={agent}>
        <ThemeProvider value={theme}>
          <StatusBar
            barStyle="light-content"
            hidden={false}
            backgroundColor={theme.ColorPallet.brand.primary}
            translucent={false}
          />
          <ConnectionModal />
          <ErrorModal />
          <RootStack setAgent={setAgent} />
          <Toast topOffset={15} config={toastConfig} />
        </ThemeProvider>
      </AgentProvider>
    </StoreProvider>
  )
}

export default App
