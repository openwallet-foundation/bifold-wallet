import { createStackNavigator } from '@react-navigation/stack'
import React, { useState } from 'react'

import Splash from '../screens/Splash'

import AuthenticateStack from './AuthenticateStack'
import ScanStack from './ScanStack'
import TabStack from './TabStack'
import defaultStackOptions from './defaultStackOptions'

const Stack = createStackNavigator()

function RootStack() {
  const [authenticated, setAuthenticated] = useState(false)

  return (
    <Stack.Navigator screenOptions={{ ...defaultStackOptions, headerShown: false }}>
      {authenticated ? (
        <Stack.Group>
          <Stack.Screen name="Tabs">{() => <TabStack />}</Stack.Screen>
          <Stack.Screen name="Connect" options={{ presentation: 'modal' }}>
            {() => <ScanStack />}
          </Stack.Screen>
        </Stack.Group>
      ) : (
        <Stack.Group>
          <Stack.Screen name="Authenticate" options={{ presentation: 'modal' }}>
            {() => <AuthenticateStack setAuthenticated={setAuthenticated} />}
          </Stack.Screen>
        </Stack.Group>
      )}
    </Stack.Navigator>
  )
}

export default RootStack
