import React, { useState } from 'react'
import { View } from 'react-native'
import Config from 'react-native-config'

import { AutoAcceptCredential, ConsoleLogger, LogLevel, MediatorPickupStrategy } from '@aries-framework/core'
import indy from 'indy-sdk-react-native'

import AgentProvider from 'aries-hooks'

import TabNavigator from './App/navigators/TabNavigator'
import AuthenticateStack from './App/navigators/AuthenticateStack'
import { Provider } from 'react-redux'
import { applyMiddleware, createStore } from 'redux'
import reducers from './App/appRedux/reducers'
import ReduxThunk from 'redux-thunk'

const agentConfig = {
  label: 'Aries Bifold',
  mediatorConnectionsInvite: Config.MEDIATOR_URL,
  mediatorPickupStrategy: MediatorPickupStrategy.Implicit,
  walletConfig: { id: 'wallet4', key: '123' },
  autoAcceptConnections: true,
  autoAcceptCredentials: AutoAcceptCredential.ContentApproved,
  poolName: 'test-183',
  logger: new ConsoleLogger(LogLevel.trace),
  indy,
}

const App = () => {
  const [authenticated, setAuthenticated] = useState(false)

  return (
    <Provider store={createStore(reducers, {}, applyMiddleware(ReduxThunk))}>
      <AgentProvider agentConfig={agentConfig} genesisUrl={Config.GENESIS_URL}>
        <View style={{ height: '100%' }}>
          {authenticated ? <TabNavigator /> : <AuthenticateStack setAuthenticated={setAuthenticated} />}
        </View>
      </AgentProvider>
    </Provider>
  )
}

export default App
