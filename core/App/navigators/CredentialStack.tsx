import { createStackNavigator } from '@react-navigation/stack'
import React from 'react'

import SettingsCog from '../components/misc/SettingsCog'
import CredentialDetails from '../screens/CredentialDetails'
import ListCredentials from '../screens/ListCredentials'
import { CredentialStackParams, Screens } from '../types/navigators'
import { useThemeContext } from '../utils/themeContext'

import { createDefaultStackOptions } from './defaultStackOptions'

const CredentialStack: React.FC = () => {
  const Stack = createStackNavigator<CredentialStackParams>()
  const theme = useThemeContext()
  const defaultStackOptions = createDefaultStackOptions(theme)
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
    </Stack.Navigator>
  )
}

export default CredentialStack
