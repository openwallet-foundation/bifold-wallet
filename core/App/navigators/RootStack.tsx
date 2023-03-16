import { useAgent } from '@aries-framework/react-hooks'
import { useNavigation } from '@react-navigation/core'
import { createStackNavigator, StackNavigationProp } from '@react-navigation/stack'
import React, { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AppState } from 'react-native'

import { walletTimeout } from '../constants'
import { useAuth } from '../contexts/auth'
import { useConfiguration } from '../contexts/configuration'
import { DispatchAction } from '../contexts/reducers/store'
import { useStore } from '../contexts/store'
import { useTheme } from '../contexts/theme'
import { useDeepLinks } from '../hooks/deep-links'
import AttemptLockout from '../screens/AttemptLockout'
import Onboarding from '../screens/Onboarding'
import { createCarouselStyle } from '../screens/OnboardingPages'
import PINCreate from '../screens/PINCreate'
import PINEnter from '../screens/PINEnter'
import { AuthenticateStackParams, Screens, Stacks } from '../types/navigators'
import { connectFromInvitation, getOobDeepLink } from '../utils/helpers'

import ConnectStack from './ConnectStack'
import ContactStack from './ContactStack'
import DeliveryStack from './DeliveryStack'
import NotificationStack from './NotificationStack'
import ProofRequestStack from './ProofRequestStack'
import SettingStack from './SettingStack'
import TabStack from './TabStack'
import { createDefaultStackOptions } from './defaultStackOptions'

const RootStack: React.FC = () => {
  const [state, dispatch] = useStore()
  const { removeSavedWalletSecret } = useAuth()
  const { agent } = useAgent()
  const appState = useRef(AppState.currentState)
  const [backgroundTime, setBackgroundTime] = useState<number | undefined>(undefined)
  const [prevAppStateVisible, setPrevAppStateVisible] = useState<string>('')
  const [appStateVisible, setAppStateVisible] = useState<string>('')
  const { t } = useTranslation()
  const navigation = useNavigation<StackNavigationProp<AuthenticateStackParams>>()
  const theme = useTheme()
  const defaultStackOptions = createDefaultStackOptions(theme)
  const OnboardingTheme = theme.OnboardingTheme
  const { pages, terms, splash, useBiometry } = useConfiguration()
  useDeepLinks()

  const lockoutUser = async () => {
    if (agent && state.authentication.didAuthenticate) {
      // make shure agent is shutdown so wallet isn't still open
      removeSavedWalletSecret()
      await agent.shutdown()
      dispatch({
        type: DispatchAction.DID_AUTHENTICATE,
        payload: [{ didAuthenticate: false }],
      })
      dispatch({
        type: DispatchAction.LOCKOUT_UPDATED,
        payload: [{ displayNotification: true }],
      })
    }
  }

  // handle deeplink events
  useEffect(() => {
    async function handleDeepLink(deepLink: string) {
      try {
        // Try connection based
        const connectionRecord = await connectFromInvitation(deepLink, agent)
        navigation.navigate(Stacks.ConnectionStack as any, {
          screen: Screens.Connection,
          params: { connectionId: connectionRecord.id },
        })
      } catch {
        try {
          // Try connectionless here
          const message = await getOobDeepLink(deepLink, agent)
          navigation.navigate(Stacks.ConnectionStack as any, {
            screen: Screens.Connection,
            params: { threadId: message['@id'] },
          })
        } catch (error) {
          // TODO:(am add error handling here)
        }
      }

      // set deeplink as inactive
      dispatch({
        type: DispatchAction.ACTIVE_DEEP_LINK,
        payload: [undefined],
      })
    }
    if (agent && state.deepLink.activeDeepLink && state.authentication.didAuthenticate) {
      handleDeepLink(state.deepLink.activeDeepLink)
    }
  }, [agent, state.deepLink.activeDeepLink, state.authentication.didAuthenticate])

  useEffect(() => {
    AppState.addEventListener('change', (nextAppState) => {
      if (appState.current.match(/active/) && nextAppState.match(/inactive|background/)) {
        //update time that app gets put in background
        setBackgroundTime(Date.now())
      }

      setPrevAppStateVisible(appState.current)
      appState.current = nextAppState
      setAppStateVisible(appState.current)
    })
  }, [])

  useEffect(() => {
    if (appStateVisible.match(/active/) && prevAppStateVisible.match(/inactive|background/) && backgroundTime) {
      // prevents the user from being locked out during metro reloading
      setPrevAppStateVisible(appStateVisible)
      //lock user out after 5 minutes
      if (walletTimeout && backgroundTime && Date.now() - backgroundTime > walletTimeout) {
        lockoutUser()
      }
    }
  }, [appStateVisible, prevAppStateVisible, backgroundTime])

  const onTutorialCompleted = () => {
    dispatch({
      type: DispatchAction.DID_COMPLETE_TUTORIAL,
    })
    navigation.navigate(Screens.Terms)
  }

  const onAuthenticated = (status: boolean): void => {
    if (!status) {
      return
    }

    dispatch({
      type: DispatchAction.DID_AUTHENTICATE,
    })
  }

  const authStack = () => {
    const Stack = createStackNavigator()

    return (
      <Stack.Navigator initialRouteName={Screens.Splash} screenOptions={{ ...defaultStackOptions, headerShown: false }}>
        <Stack.Screen name={Screens.Splash} component={splash} />
        <Stack.Screen
          name={Screens.EnterPIN}
          options={() => ({
            title: t('Screens.EnterPIN'),
            headerShown: true,
            headerLeft: () => false,
            rightLeft: () => false,
          })}
        >
          {(props) => <PINEnter {...props} setAuthenticated={onAuthenticated} />}
        </Stack.Screen>
        <Stack.Screen
          name={Screens.AttemptLockout}
          component={AttemptLockout}
          options={{ headerShown: true, headerLeft: () => null }}
        ></Stack.Screen>
      </Stack.Navigator>
    )
  }

  const mainStack = () => {
    const Stack = createStackNavigator()

    return (
      <Stack.Navigator initialRouteName={Screens.Splash} screenOptions={{ ...defaultStackOptions, headerShown: false }}>
        <Stack.Screen name={Screens.Splash} component={splash} />
        <Stack.Screen name={Stacks.TabStack} component={TabStack} />
        <Stack.Screen name={Stacks.ConnectStack} component={ConnectStack} options={{ presentation: 'modal' }} />
        <Stack.Screen name={Stacks.SettingStack} component={SettingStack} />
        <Stack.Screen name={Stacks.ContactStack} component={ContactStack} />
        <Stack.Screen name={Stacks.NotificationStack} component={NotificationStack} />
        <Stack.Screen name={Stacks.ConnectionStack} component={DeliveryStack} />
        <Stack.Screen name={Stacks.ProofRequestsStack} component={ProofRequestStack} />
      </Stack.Navigator>
    )
  }

  const onboardingStack = () => {
    const Stack = createStackNavigator()
    const carousel = createCarouselStyle(OnboardingTheme)
    return (
      <Stack.Navigator initialRouteName={Screens.Splash} screenOptions={{ ...defaultStackOptions, headerShown: false }}>
        <Stack.Screen name={Screens.Splash} component={splash} />
        <Stack.Screen
          name={Screens.Onboarding}
          options={() => ({
            title: t('Screens.Onboarding'),
            headerTintColor: OnboardingTheme.headerTintColor,
            headerShown: true,
            gestureEnabled: false,
            headerLeft: () => false,
          })}
        >
          {(props) => (
            <Onboarding
              {...props}
              nextButtonText={t('Global.Next')}
              previousButtonText={t('Global.Back')}
              pages={pages(onTutorialCompleted, OnboardingTheme)}
              style={carousel}
            />
          )}
        </Stack.Screen>
        <Stack.Screen
          name={Screens.Terms}
          options={() => ({
            title: t('Screens.Terms'),
            headerTintColor: OnboardingTheme.headerTintColor,
            headerShown: true,
            headerLeft: () => false,
            rightLeft: () => false,
          })}
          component={terms}
        />
        <Stack.Screen
          name={Screens.CreatePIN}
          options={() => ({
            title: t('Screens.CreatePIN'),
            headerShown: true,
            headerLeft: () => false,
            rightLeft: () => false,
          })}
        >
          {(props) => <PINCreate {...props} setAuthenticated={onAuthenticated} />}
        </Stack.Screen>
        <Stack.Screen
          name={Screens.UseBiometry}
          options={() => ({
            title: t('Screens.Biometry'),
            headerTintColor: OnboardingTheme.headerTintColor,
            headerShown: true,
            headerLeft: () => false,
            rightLeft: () => false,
          })}
          component={useBiometry}
        />
      </Stack.Navigator>
    )
  }

  if (
    state.onboarding.didAgreeToTerms &&
    state.onboarding.didCompleteTutorial &&
    state.onboarding.didCreatePIN &&
    state.onboarding.didConsiderBiometry
  ) {
    return state.authentication.didAuthenticate ? mainStack() : authStack()
  }

  return onboardingStack()
}

export default RootStack
