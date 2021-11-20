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
import Toast from 'react-native-toast-message'

import RootStack from './App/navigators/RootStack'
import indyLedgers from './configs/ledgers/indy'
import toastConfig from './configs/toast/toastConfig'

import './App/localization'
import { initStoredLanguage } from './App/localization'

const App = () => {
  const [agent, setAgent] = useState<Agent | undefined>(undefined)
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
    initAgent()
  }, [])

  return (
    <AgentProvider agent={agent}>
      <RootStack />
      <Toast topOffset={15} config={toastConfig} />
    </AgentProvider>
  )
}

export default App
