import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'

import ListContacts from '../screens/ListContacts'
import defaultStackOptions from './defaultStackOptions'
import ContactDetails from '../screens/ContactDetails'

export type ContactStackParams = {
  Contacts: undefined
  'Contact Details': { connectionId: string }
}

const Stack = createStackNavigator<ContactStackParams>()

function ContactStack() {
  return (
    <Stack.Navigator screenOptions={defaultStackOptions}>
      <Stack.Screen name="Contacts" component={ListContacts} />
      <Stack.Screen name="Contact Details" component={ContactDetails} />
    </Stack.Navigator>
  )
}

export default ContactStack
