import { createStackNavigator } from '@react-navigation/stack'
import React from 'react'

import CredentialDetails from '../screens/CredentialDetails'
import ListCredentials from '../screens/ListCredentials'
import { CredentialStackParams, Screens, Stacks } from '../types/navigators'

import SettingStack from './SettingStack'
import defaultStackOptions from './defaultStackOptions'

import SettingsCog from 'components/misc/SettingsCog'

const CredentialStack: React.FC = () => {
  const Stack = createStackNavigator<CredentialStackParams>()

  return (
    <Stack.Navigator screenOptions={{ ...defaultStackOptions }}>
      <Stack.Screen
        name={Screens.Credentials}
        component={ListCredentials}
        options={() => ({
          headerRight: () => <SettingsCog />,
        })}
      />
      <Stack.Screen name={Screens.CredentialDetails} component={CredentialDetails} />
      <Stack.Screen name={Stacks.SettingStack} component={SettingStack} options={{ headerShown: false }} />
    </Stack.Navigator>
  )
}

export default CredentialStack
