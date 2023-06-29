import { createStackNavigator } from '@react-navigation/stack'
import React from 'react'
import { useTranslation } from 'react-i18next'

import HeaderButton, { ButtonLocation } from '../components/buttons/HeaderButton'
import SettingsMenu from '../components/buttons/SettingsMenu'
import { useTheme } from '../contexts/theme'
import ContactDetails from '../screens/ContactDetails'
import Home from '../screens/Home'
import ListNotifications from '../screens/ListNotifications'
import { HomeStackParams, Screens } from '../types/navigators'
import { testIdWithKey } from '../utils/testable'

import { createDefaultStackOptions } from './defaultStackOptions'

const HomeStack: React.FC = () => {
  const Stack = createStackNavigator<HomeStackParams>()
  const theme = useTheme()
  const { t } = useTranslation()
  const defaultStackOptions = createDefaultStackOptions(theme)

  return (
    <Stack.Navigator screenOptions={{ ...defaultStackOptions }}>
      <Stack.Screen
        name={Screens.Home}
        component={Home}
        options={() => ({
          title: t('Screens.Home'),
          headerRight: () => null,
          headerLeft: () => <SettingsMenu />,
        })}
      />
      <Stack.Screen
        name={Screens.Notifications}
        component={ListNotifications}
        options={() => ({
          title: t('Screens.Notifications'),
        })}
      />
      <Stack.Screen
        name={Screens.ContactDetails}
        component={ContactDetails}
        options={({ navigation }) => ({
          title: '',
          headerLeft: () => (
            <HeaderButton
              buttonLocation={ButtonLocation.Left}
              accessibilityLabel={t('Global.Back')}
              testID={testIdWithKey('BackButton')}
              onPress={() => navigation.navigate(Screens.Home)}
              icon="arrow-left"
            />
          ),
        })}
      />
    </Stack.Navigator>
  )
}

export default HomeStack
