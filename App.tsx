import React, { useEffect, useState } from 'react'
import { View } from 'react-native'
import Config from 'react-native-config'

import { AutoAcceptCredential, ConsoleLogger, LogLevel, MediatorPickupStrategy } from '@aries-framework/core'
import indy from 'indy-sdk-react-native'

import AgentProvider from 'aries-hooks'

import TabNavigator from './App/navigators/TabNavigator'
import AuthenticateStack from './App/navigators/AuthenticateStack'
import { I18nextProvider } from 'react-i18next'
import { i18n, initStoredLanguage, RNLocalize } from './App/locales'

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
  initStoredLanguage()

  return (
    <I18nextProvider i18n={i18n}>
      <AgentProvider agentConfig={agentConfig} genesisUrl={Config.GENESIS_URL}>
        <View style={{ height: '100%' }}>
          {authenticated ? <TabNavigator /> : <AuthenticateStack setAuthenticated={setAuthenticated} />}
        </View>
      </AgentProvider>
    </I18nextProvider>
  )
}

export default App
