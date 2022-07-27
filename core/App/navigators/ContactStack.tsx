import { createStackNavigator } from '@react-navigation/stack'
import React from 'react'

import { useTheme } from '../contexts/theme'
import Chat from '../screens/Chat'
import ContactDetails from '../screens/ContactDetails'
import ListContacts from '../screens/ListContacts'
import { ContactStackParams, Screens } from '../types/navigators'

import { createDefaultStackOptions } from './defaultStackOptions'

const ContactStack: React.FC = () => {
  const Stack = createStackNavigator<ContactStackParams>()
  const theme = useTheme()
  const defaultStackOptions = createDefaultStackOptions(theme)
  return (
    <Stack.Navigator screenOptions={{ ...defaultStackOptions }}>
      <Stack.Screen name={Screens.Contacts} component={ListContacts} options={{ headerBackTitleVisible: false }} />
      <Stack.Screen name={Screens.ContactDetails} component={ContactDetails} />
      <Stack.Screen name={Screens.Chat} component={Chat} />
    </Stack.Navigator>
  )
}

export default ContactStack
