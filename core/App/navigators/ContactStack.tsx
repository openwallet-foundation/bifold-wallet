import { createStackNavigator } from '@react-navigation/stack'
import React from 'react'
import { useTranslation } from 'react-i18next'

import { useTheme } from '../contexts/theme'
import Chat from '../screens/Chat'
import ContactDetails from '../screens/ContactDetails'
import ListContacts from '../screens/ListContacts'
import { ContactStackParams, Screens } from '../types/navigators'

import { createDefaultStackOptions } from './defaultStackOptions'

const ContactStack: React.FC = () => {
  const Stack = createStackNavigator<ContactStackParams>()
  const theme = useTheme()
  const { t } = useTranslation()
  const defaultStackOptions = createDefaultStackOptions(theme)
  return (
    <Stack.Navigator screenOptions={{ ...defaultStackOptions }}>
      <Stack.Screen name={Screens.Contacts} component={ListContacts} options={{ title: t('Screens.Contacts') }} />
      <Stack.Screen
        name={Screens.ContactDetails}
        component={ContactDetails}
        options={{ title: t('Screens.ContactDetails') }}
      />
      <Stack.Screen name={Screens.Chat} component={Chat} />
    </Stack.Navigator>
  )
}

export default ContactStack
