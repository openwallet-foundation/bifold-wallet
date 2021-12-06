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
import Config from 'react-native-config'
import SplashScreen from 'react-native-splash-screen'
import Toast from 'react-native-toast-message'

import { initStoredLanguage } from './App/localization'
import RootStack from './App/navigators/RootStack'
import Splash from './App/screens/Splash'
import indyLedgers from './configs/ledgers/indy'
import toastConfig from './configs/toast/toastConfig'

const App = () => {
  const [agent, setAgent] = useState<Agent | undefined>(undefined)
  const [loading, setLoading] = useState(true)
  // const { translations } = useContext(LocalizationContext)

  initStoredLanguage()

  const initAgent = async () => {
    const newAgent = new Agent(
      {
        label: 'Aries Bifold',
        mediatorConnectionsInvite: Config.MEDIATOR_URL,
        mediatorPickupStrategy: MediatorPickupStrategy.Implicit,
        walletConfig: { id: 'wallet4', key: '123' },
        autoAcceptConnections: true,
        autoAcceptCredentials: AutoAcceptCredential.ContentApproved,
        logger: new ConsoleLogger(LogLevel.trace),
        indyLedgers,
      },
      agentDependencies
    )

    const wsTransport = new WsOutboundTransport()
    const httpTransport = new HttpOutboundTransport()

    newAgent.registerOutboundTransport(wsTransport)
    newAgent.registerOutboundTransport(httpTransport)

    await newAgent.initialize()
    setAgent(newAgent)
  }

  useEffect(() => {
    // Hide the native splash / loading screen so that our
    // RN version can be displayed.
    SplashScreen.hide()
    initAgent()

    setTimeout(() => {
      // The app loads quite fast, this delay is to allow for a more
      // graceful transition.
      setLoading(false)
    }, 2000)
  }, [loading])

  if (loading) {
    return <Splash />
  }

  return (
    <AgentProvider agent={agent}>
      <RootStack />
      <Toast topOffset={15} config={toastConfig} />
    </AgentProvider>
  )
}

export default App
