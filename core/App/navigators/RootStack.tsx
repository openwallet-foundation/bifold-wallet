import {
  Agent,
  AutoAcceptCredential,
  ConsoleLogger,
  HttpOutboundTransport,
  LogLevel,
  MediatorPickupStrategy,
  WsOutboundTransport,
} from '@aries-framework/core'
import { agentDependencies } from '@aries-framework/react-native'
import { useNavigation } from '@react-navigation/core'
import { createStackNavigator, StackNavigationProp } from '@react-navigation/stack'
import React, { useContext, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Config } from 'react-native-config'
import Toast from 'react-native-toast-message'

import indyLedgers from '../../configs/ledgers/indy'
import { ToastType } from '../components/toast/BaseToast'
import Onboarding from '../screens/Onboarding'
import { pages, createCarouselStyle } from '../screens/OnboardingPages'
import PinCreate from '../screens/PinCreate'
import PinEnter from '../screens/PinEnter'
import Splash from '../screens/Splash'
import Terms from '../screens/Terms'
import { Context } from '../store/Store'
import { DispatchAction } from '../store/reducer'
import { StateFn } from '../types/fn'
import { AuthenticateStackParams, Screens, Stacks } from '../types/navigators'
import { useThemeContext } from '../utils/themeContext'

import ConnectStack from './ConnectStack'
import ContactStack from './ContactStack'
import DeliveryStack from './DeliveryStack'
import NotificationStack from './NotificationStack'
import SettingStack from './SettingStack'
import TabStack from './TabStack'
import { createDefaultStackOptions } from './defaultStackOptions'

interface RootStackProps {
  setAgent: React.Dispatch<React.SetStateAction<Agent | undefined>>
}

const RootStack: React.FC<RootStackProps> = (props: RootStackProps) => {
  const { setAgent } = props
  const [state, dispatch] = useContext(Context)
  const { t } = useTranslation()
  const navigation = useNavigation<StackNavigationProp<AuthenticateStackParams>>()

  const [authenticated, setAuthenticated] = useState(false)
  const [agentInitDone, setAgentInitDone] = useState(false)
  const [initAgentInProcess, setInitAgentInProcess] = useState(false)

  const theme = useThemeContext()
  const defaultStackOptions = createDefaultStackOptions(theme)
  const ColorPallet = theme.ColorPallet
  const onTutorialCompleted = () => {
    dispatch({
      type: DispatchAction.SetTutorialCompletionStatus,
      payload: [{ DidCompleteTutorial: true }],
    })

    navigation.navigate(Screens.Terms)
  }

  const initAgent = async () => {
    if (initAgentInProcess) {
      return
    }

    Toast.show({
      type: ToastType.Info,
      text1: t('StatusMessages.InitAgent'),
      position: 'bottom',
    })

    //Flag to protect the init process from being duplicated
    setInitAgentInProcess(true)

    try {
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
      setAgent(newAgent) // -> This will set the agent in the global provider
      setAgentInitDone(true)
      Toast.show({
        type: ToastType.Success,
        text1: 'Wallet initialized',
        autoHide: true,
        visibilityTime: 2000,
        position: 'bottom',
      })
    } catch (e: unknown) {
      Toast.show({
        type: ToastType.Error,
        text1: t('Global.Failure'),
        text2: (e as Error)?.message || t('Error.Unknown'),
        visibilityTime: 2000,
        position: 'bottom',
      })
    }

    setInitAgentInProcess(false)
  }

  useEffect(() => {
    if (authenticated && !agentInitDone) {
      initAgent()
    }
  }, [authenticated])

  const authStack = (setAuthenticated: StateFn) => {
    const Stack = createStackNavigator()

    return (
      <Stack.Navigator initialRouteName={Screens.Splash} screenOptions={{ ...defaultStackOptions, headerShown: false }}>
        <Stack.Screen name={Screens.EnterPin}>
          {(props) => <PinEnter {...props} setAuthenticated={setAuthenticated} />}
        </Stack.Screen>
      </Stack.Navigator>
    )
  }

  const mainStack = () => {
    const Stack = createStackNavigator()

    return (
      <Stack.Navigator initialRouteName={Screens.Splash} screenOptions={{ ...defaultStackOptions, headerShown: false }}>
        <Stack.Screen name={Stacks.TabStack} component={TabStack} />
        <Stack.Screen name={Stacks.ConnectStack} component={ConnectStack} options={{ presentation: 'modal' }} />
        <Stack.Screen name={Stacks.SettingStack} component={SettingStack} />
        <Stack.Screen name={Stacks.ContactStack} component={ContactStack} />
        <Stack.Screen name={Stacks.NotificationStack} component={NotificationStack} />
        <Stack.Screen name={Stacks.ConnectionStack} component={DeliveryStack} />
      </Stack.Navigator>
    )
  }

  const onboardingStack = (setAuthenticated: StateFn) => {
    const Stack = createStackNavigator()
    const carousel = createCarouselStyle(theme)
    return (
      <Stack.Navigator initialRouteName={Screens.Splash} screenOptions={{ ...defaultStackOptions, headerShown: false }}>
        <Stack.Screen name={Screens.Splash} component={Splash} />
        <Stack.Screen
          name={Screens.Onboarding}
          options={() => ({
            title: t('Screens.Onboarding'),
            headerTintColor: ColorPallet.grayscale.white,
            headerShown: true,
            gestureEnabled: false,
            headerLeft: () => false,
          })}
        >
          {(props) => (
            <Onboarding
              {...props}
              nextButtonText={'Next'}
              previousButtonText={'Back'}
              pages={pages(onTutorialCompleted, theme)}
              style={carousel}
            />
          )}
        </Stack.Screen>
        <Stack.Screen
          name={Screens.Terms}
          options={() => ({
            title: t('Screens.Terms'),
            headerTintColor: ColorPallet.grayscale.white,
            headerShown: true,
            headerLeft: () => false,
            rightLeft: () => false,
          })}
          component={Terms}
        />
        <Stack.Screen name={Screens.CreatePin}>
          {(props) => <PinCreate {...props} setAuthenticated={setAuthenticated} />}
        </Stack.Screen>
      </Stack.Navigator>
    )
  }

  if (state.onboarding.DidAgreeToTerms && state.onboarding.DidCompleteTutorial && state.onboarding.DidCreatePIN) {
    return authenticated ? mainStack() : authStack(setAuthenticated)
  }

  return onboardingStack(setAuthenticated)
}

export default RootStack
