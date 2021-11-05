import { createStackNavigator } from '@react-navigation/stack'
import React from 'react'

import ContactDetails from '../screens/ContactDetails'
import ListContacts from '../screens/ListContacts'

import defaultStackOptions from './defaultStackOptions'

export type ContactStackParams = {
  Contacts: undefined
  'Contact Details': { connectionId: string }
}

const Stack = createStackNavigator<ContactStackParams>()

function ContactStack() {
  return (
    <Stack.Navigator screenOptions={defaultStackOptions}>
      <Stack.Screen name="Contacts" component={ListContacts} options={{ headerShown: false }} />
      <Stack.Screen name="Contact Details" component={ContactDetails} options={{ headerShown: false }} />
    </Stack.Navigator>
  )
}

export default ContactStack
