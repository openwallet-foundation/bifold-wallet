import { useNavigation } from '@react-navigation/core'
import { createStackNavigator } from '@react-navigation/stack'
import React, { useContext, useState } from 'react'
import { Text, TouchableOpacity, View } from 'react-native'

import { Colors } from '../Theme'
import Arrow from '../assets/img/large-arrow.svg'
import { Screens } from '../constants'
import { DispatchAction } from '../store/reducer'
import Onboarding from '../screens/Onboarding'
import { pages, carousel } from '../screens/OnboardingPages'
import PinCreate from '../screens/PinCreate'
import PinEnter from '../screens/PinEnter'
import Splash from '../screens/Splash'
import Terms from '../screens/Terms'
import { Context } from '../store/Store'

import ScanStack from './ScanStack'
import TabStack from './TabStack'
import defaultStackOptions from './defaultStackOptions'

type GenericFn = () => void
type StateFn = React.Dispatch<React.SetStateAction<boolean>>

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
      <Stack.Screen name="Tabs">{() => <TabStack />}</Stack.Screen>
      <Stack.Screen name="Connect" options={{ presentation: 'modal' }}>
        {() => <ScanStack />}
      </Stack.Screen>
    </Stack.Navigator>
  )
}

const onboardingStack = (onSkipTouched: GenericFn, setAuthenticated: StateFn) => {
  const Stack = createStackNavigator()

  return (
    <Stack.Navigator initialRouteName={Screens.Splash} screenOptions={{ ...defaultStackOptions, headerShown: false }}>
      <Stack.Screen name={Screens.Splash} component={Splash} />
      <Stack.Screen
        name={Screens.Onboarding}
        options={() => ({
          headerShown: true,
          gestureEnabled: false,
          headerLeft: () => false,
          headerRight: () => {
            return (
              <TouchableOpacity onPress={onSkipTouched} style={{ marginRight: 14 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={{ color: 'white', fontWeight: 'bold', marginRight: 4 }}>Skip</Text>
                  <Arrow height={15} width={15} fill={Colors.white} style={{ transform: [{ rotate: '180deg' }] }} />
                </View>
              </TouchableOpacity>
            )
          },
        })}
      >
        {(props) => (
          <Onboarding {...props} nextButtonText={'Next'} previousButtonText={'Back'} pages={pages} style={carousel} />
        )}
      </Stack.Screen>
      <Stack.Screen name={Screens.Terms} component={Terms} />
      <Stack.Screen name={Screens.CreatePin}>
        {(props) => <PinCreate {...props} setAuthenticated={setAuthenticated} />}
      </Stack.Screen>
    </Stack.Navigator>
  )
}

const RootStack: React.FC = () => {
  const [authenticated, setAuthenticated] = useState(false)
  const [state, dispatch] = useContext(Context)
  const nav = useNavigation()

  const onSkipTouched = () => {
    dispatch({
      type: DispatchAction.SetTutorialCompletionStatus,
      payload: [{ DidCompleteTutorial: true }],
    })

    nav.navigate(Screens.Terms)
  }

  if (state.onboarding.DidAgreeToTerms && state.onboarding.DidCompleteTutorial && state.onboarding.DidCreatePIN) {
    return authenticated ? mainStack() : authStack(setAuthenticated)
  }

  return onboardingStack(onSkipTouched, setAuthenticated)
}

export default RootStack
