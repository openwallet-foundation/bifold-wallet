import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'

import ListContacts from '../screens/ListContacts'
import defaultStackOptions from './defaultStackOptions'
import ContactDetails from '../screens/ContactDetails'
import { useTranslation } from 'react-i18next'

const Stack = createStackNavigator()

function ContactStack() {
  const { t } = useTranslation()

  return (
    <Stack.Navigator screenOptions={defaultStackOptions}>
      <Stack.Screen options={{ title: t('ContactStack.contacts') }} name="Contacts" component={ListContacts} />
      <Stack.Screen
        options={{ title: t('ContactStack.contactDetails') }}
        name="ContactDetails"
        component={ContactDetails}
      />
    </Stack.Navigator>
  )
}

export default ContactStack
