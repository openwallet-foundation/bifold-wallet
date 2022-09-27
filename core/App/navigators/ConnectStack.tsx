import { CommonActions, useFocusEffect, useNavigation } from '@react-navigation/core'
import { createStackNavigator } from '@react-navigation/stack'
import React from 'react'

import { uiConfig } from '../../configs/uiConfig'
import { useTheme } from '../contexts/theme'
import Connect from '../screens/Connect'
import DisplayCode from '../screens/DisplayCode'
import Scan from '../screens/Scan'
import { ConnectStackParams, Screens } from '../types/navigators'

import { createDefaultStackOptions } from './defaultStackOptions'

const ConnectStack: React.FC = () => {
  const navigation = useNavigation()
  const Stack = createStackNavigator<ConnectStackParams>()
  const theme = useTheme()
  const defaultStackOptions = createDefaultStackOptions(theme)

  // Needed to reset the stack history when navigating away for improved UX
  useFocusEffect(
    React.useCallback(() => {
      // Do something when the screen is focused
      return () => {
        // Do something when the screen is unfocused
        // Useful for cleanup functions

        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [
              { name: Screens.Connect },
            ],
          })
        );
      }
    }, [])
  )

  return (
    <Stack.Navigator screenOptions={{ ...defaultStackOptions }}>
      {uiConfig.allowQrDisplay && <Stack.Screen name={Screens.Connect} component={Connect} />}
      <Stack.Screen name={Screens.Scan} component={Scan} options={{ presentation: 'modal', headerShown: false }} />
      <Stack.Screen
        name={Screens.DisplayCode}
        component={DisplayCode}
        options={{ presentation: 'modal', headerShown: false }}
      />
    </Stack.Navigator>
  )
}

export default ConnectStack
