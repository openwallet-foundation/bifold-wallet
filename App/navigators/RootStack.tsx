import { useNavigation } from '@react-navigation/core'
import { createStackNavigator, StackNavigationProp } from '@react-navigation/stack'
import React, { useContext, useState } from 'react'
import { useTranslation } from 'react-i18next'

import Onboarding from '../screens/Onboarding'
import { pages, carousel } from '../screens/OnboardingPages'
import PinCreate from '../screens/PinCreate'
import PinEnter from '../screens/PinEnter'
import Splash from '../screens/Splash'
import Terms from '../screens/Terms'
import { Context } from '../store/Store'
import { DispatchAction } from '../store/reducer'
import { ColorPallet } from '../theme'
import { StateFn } from '../types/fn'
import { AuthenticateStackParams, Screens, Stacks } from '../types/navigators'

import ConnectStack from './ConnectStack'
import ContactStack from './ContactStack'
import SettingStack from './SettingStack'
import TabStack from './TabStack'
import defaultStackOptions from './defaultStackOptions'

const RootStack: React.FC = () => {
  const [authenticated, setAuthenticated] = useState(false)
  const [state, dispatch] = useContext(Context)
  const { t } = useTranslation()
  const navigation = useNavigation<StackNavigationProp<AuthenticateStackParams>>()

  const onTutorialCompleted = () => {
    dispatch({
      type: DispatchAction.SetTutorialCompletionStatus,
      payload: [{ DidCompleteTutorial: true }],
    })

    navigation.navigate(Screens.Terms)
  }

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
      </Stack.Navigator>
    )
  }

  const onboardingStack = (setAuthenticated: StateFn) => {
    const Stack = createStackNavigator()

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
              pages={pages(onTutorialCompleted)}
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
