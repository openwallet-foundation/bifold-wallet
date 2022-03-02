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
import { initStoredLanguage } from './App/localization'
import RootStack from './App/navigators/RootStack'
import StoreProvider from './App/store/Store'
import { ColorPallet } from './App/theme'
import indyLedgers from './configs/ledgers/indy'

const App = () => {
  const [agent, setAgent] = useState<Agent | undefined>(undefined)

  const initAgent = async () => {
    const agent = new Agent(
      {
        label: 'Aries Bifold',
        mediatorConnectionsInvite: Config.MEDIATOR_URL,
        mediatorPickupStrategy: MediatorPickupStrategy.Implicit,
        walletConfig: { id: 'wallet4', key: '123' },
        autoAcceptConnections: true,
        autoAcceptCredentials: AutoAcceptCredential.ContentApproved,
        logger: new ConsoleLogger(LogLevel.trace),
        indyLedgers,
        connectToIndyLedgersOnStartup: false,
      },
      agentDependencies
    )

    const wsTransport = new WsOutboundTransport()
    const httpTransport = new HttpOutboundTransport()

    agent.registerOutboundTransport(wsTransport)
    agent.registerOutboundTransport(httpTransport)

    await agent.initialize()

    setAgent(agent)
  }

  initStoredLanguage().catch((err: any): void => {
    // TODO:(jl) What happens if initialization fails.
  })

  useEffect(() => {
    // Hide the native splash / loading screen so that our
    // RN version can be displayed.
    SplashScreen.hide()

    // TODO:(jl) Do we care about the actual cause? #232
    initAgent().catch((err: any): void => {
      // TODO:(jl) What happens if initialization fails? #232
    })
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
        <RootStack />
        <Toast topOffset={15} config={toastConfig} />
      </AgentProvider>
    </StoreProvider>
  )
}

export default App
