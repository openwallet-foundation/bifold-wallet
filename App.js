import React, { useState, useEffect } from 'react'
import { View } from 'react-native'
import Config from 'react-native-config'
import { ConsoleLogger } from 'aries-framework'
import indy from 'rn-indy-sdk'

import AgentProvider from 'aries-hooks'

import { downloadGenesis, storeGenesis } from './genesis-utils'

//For UUIDv4 within React Native
import 'react-native-get-random-values'

// import { AgentProvider } from './App/contexts/AgentProvider'

import TabNavigator from './App/navigators/TabNavigator'
import AuthenticateStack from './App/navigators/AuthenticateStack'

const App = () => {
  const [authenticated, setAuthenticated] = useState(false)
  const [agent, setAgent] = useState()

  useEffect(() => {
    createAgentConfig()
  }, [])

  const createAgentConfig = async () => {
    const genesis = await downloadGenesis(Config.GENESIS_URL)
    const genesisPath = await storeGenesis(genesis, 'genesis.txn')

    const agentConfig = {
      label: 'Aries Bifold',
      mediatorUrl: Config.MEDIATOR_URL,
      walletConfig: { id: 'wallet4' },
      walletCredentials: { key: '123' },
      autoAcceptConnections: true,
      poolName: 'test-183',
      genesisPath,
      logger: new ConsoleLogger(LogLevel.debug),
      indy,
    }
    setAgent(agentConfig)
  }

  return (
    <AgentProvider agent={agent}>
      <View style={{ height: '100%' }}>
        {authenticated ? <TabNavigator /> : <AuthenticateStack setAuthenticated={setAuthenticated} />}
      </View>
    </AgentProvider>
  )
}

export default App
