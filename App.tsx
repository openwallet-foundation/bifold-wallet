import React, { useEffect, useState } from 'react'
import { View } from 'react-native'
import Config from 'react-native-config'

import { 
  Agent, 
  AutoAcceptCredential, 
  ConsoleLogger, 
  HttpOutboundTransport,
  LogLevel, 
  MediatorPickupStrategy,
  WsOutboundTransport
} from '@aries-framework/core'
import { agentDependencies } from '@aries-framework/react-native'

import AgentProvider from '@aries-framework/react-hooks'

import TabNavigator from './App/navigators/TabNavigator'
import AuthenticateStack from './App/navigators/AuthenticateStack'
import IndicioTestNet from './configs/GensisFiles/IndicioTestNet'

const App = () => {
  const [authenticated, setAuthenticated] = useState(false)
  const [agent, setAgent] = useState<Agent | undefined>(undefined)

  const initAgent = async () => {
    const newAgent = new Agent({
      genesisTransactions: IndicioTestNet, 
      label: 'Aries Bifold',
      mediatorConnectionsInvite: Config.MEDIATOR_URL,
      mediatorPickupStrategy: MediatorPickupStrategy.Implicit,
      walletConfig: { id: 'wallet4', key: '123' },
      autoAcceptConnections: true,
      autoAcceptCredentials: AutoAcceptCredential.ContentApproved,
      poolName: 'test-183',
      logger: new ConsoleLogger(LogLevel.trace),
    }, agentDependencies)

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
      <View style={{ height: '100%' }}>
        {authenticated ? <TabNavigator /> : <AuthenticateStack setAuthenticated={setAuthenticated} />}
      </View>
    </AgentProvider>
  )
}

export default App
