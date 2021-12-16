import { createStackNavigator } from '@react-navigation/stack'
import React from 'react'

import ContactDetails from '../screens/ContactDetails'
import ListContacts from '../screens/ListContacts'

import defaultStackOptions from './defaultStackOptions'

export type ContactStackParams = {
  Contacts: undefined
  'Contact Details': { connectionId: string }
}

const ContactStack: React.FC = () => {
  const Stack = createStackNavigator<ContactStackParams>()

  return (
    <Stack.Navigator screenOptions={{ ...defaultStackOptions, headerShown: false }}>
      <Stack.Screen name="Contacts" component={ListContacts} />
      <Stack.Screen name="Contact Details" component={ContactDetails} />
    </Stack.Navigator>
  )
}

export default ContactStack
