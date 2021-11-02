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
import { ThemeProvider } from '@emotion/react'
import React, { useEffect, useState } from 'react'
import { View } from 'react-native'
import Config from 'react-native-config'
import AuthenticateStack from './App/navigators/AuthenticateStack'
import TabNavigator from './App/navigators/TabNavigator'
import AppTheme from './App/theme'
import indyLedgers from './configs/ledgers/indy'

const App = () => {
  const [authenticated, setAuthenticated] = useState(false)
  const [agent, setAgent] = useState<Agent | undefined>(undefined)

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
      <ThemeProvider theme={AppTheme}>
        <View style={{ height: '100%' }}>
          {authenticated ? <TabNavigator /> : <AuthenticateStack setAuthenticated={setAuthenticated} />}
        </View>
      </ThemeProvider>
    </AgentProvider>
  )
}

export default App
