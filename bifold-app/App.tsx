/* eslint-disable import/no-named-as-default */
/* eslint-disable import/no-extraneous-dependencies */
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
import {
  ConnectionModal,
  toastConfig,
  initStoredLanguage,
  RootStack,
  indyLedgers,
  ErrorModal,
  StoreProvider,
  ThemeProvider,
  defaultTheme as theme,
  ConfigurationContext,
  ConfigurationProvider,
  initLanguages,
  defaultTranslationResources,
  defaultOnboardingPages as onboardingPages,
  defaultSplashScreen as splashSreen,
  defaultTerms as termsSreen,
} from 'aries-bifold'
import { default as React, useEffect, useState } from 'react'
import { StatusBar } from 'react-native'
import Config from 'react-native-config'
import SplashScreen from 'react-native-splash-screen'
import Toast from 'react-native-toast-message'

const translationResources = defaultTranslationResources
initLanguages(translationResources)
const App = () => {
  const [agent, setAgent] = useState<Agent | undefined>(undefined)
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
        connectToIndyLedgersOnStartup: false,
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
  }, [])
  const defaultConfiguration: ConfigurationContext = {
    onboarding: {
      pages: onboardingPages,
    },
    splash: splashSreen,
    terms: termsSreen,
  }
  return (
    <StoreProvider>
      <AgentProvider agent={agent}>
        <ThemeProvider value={theme}>
          <ConfigurationProvider value={defaultConfiguration}>
            <StatusBar
              barStyle="light-content"
              hidden={false}
              backgroundColor={theme.ColorPallet.brand.primary}
              translucent={false}
            />
            <ConnectionModal />
            <ErrorModal />
            <RootStack />
            <Toast topOffset={15} config={toastConfig} />
          </ConfigurationProvider>
        </ThemeProvider>
      </AgentProvider>
    </StoreProvider>
  )
}

export default App
