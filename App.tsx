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
import toastConfig from './App/components/toast/ToastConfig'
import { initStoredLanguage } from './App/localization'
import RootStack from './App/navigators/RootStack'
import StoreProvider from './App/store/Store'
import { ColorPallet } from './App/theme'
import indyLedgers from './configs/ledgers/indy'

import ErrorModal from 'components/modals/ErrorModal'

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
        <StatusBar
          barStyle="light-content"
          hidden={false}
          backgroundColor={ColorPallet.brand.primary}
          translucent={false}
        />
        <ConnectionModal />
        <ErrorModal />
        <RootStack setAgent={setAgent} />
        <Toast topOffset={15} config={toastConfig} />
      </AgentProvider>
    </StoreProvider>
  )
}

export default App
