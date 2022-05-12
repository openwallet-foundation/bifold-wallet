import { createStackNavigator } from '@react-navigation/stack'
import React from 'react'

import SettingsCog from '../components/misc/SettingsCog'
import { useTheme } from '../contexts/theme'
import CredentialDetails from '../screens/CredentialDetails'
import ListCredentials from '../screens/ListCredentials'
import { CredentialStackParams, Screens } from '../types/navigators'
import { fiveTabDisplay } from '../../configs/uiConfig'

import { createDefaultStackOptions } from './defaultStackOptions'

const CredentialStack: React.FC = () => {
  const Stack = createStackNavigator<CredentialStackParams>()
  const theme = useTheme()
  const defaultStackOptions = createDefaultStackOptions(theme)
  return (
    <Stack.Navigator screenOptions={{ ...defaultStackOptions }}>
      <Stack.Screen
        name={Screens.Credentials}
        component={ListCredentials}
        options={() => ( !fiveTabDisplay ? {
          headerRight: () => <SettingsCog />,
        } : {})}
      />
      <Stack.Screen name={Screens.CredentialDetails} component={CredentialDetails} />
    </Stack.Navigator>
  )
}

export default CredentialStack
