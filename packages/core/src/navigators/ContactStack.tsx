import { createStackNavigator } from '@react-navigation/stack'
import React from 'react'
import { useTranslation } from 'react-i18next'

import HeaderRightHome from '../components/buttons/HeaderHome'
import { useTheme } from '../contexts/theme'
import Chat from '../screens/Chat'
import ContactDetails from '../screens/ContactDetails'
import CredentialDetails from '../screens/CredentialDetails'
import CredentialOffer from '../screens/CredentialOffer'
import ListContacts from '../screens/ListContacts'
import ProofDetails from '../screens/ProofDetails'
import ProofRequest from '../screens/ProofRequest'
import RenameContact from '../screens/RenameContact'
import JSONDetails from '../screens/JSONDetails'
import WhatAreContacts from '../screens/WhatAreContacts'
import { ContactStackParams, Screens } from '../types/navigators'

import { useDefaultStackOptions } from './defaultStackOptions'
import { TOKENS, useServices } from '../container-api'

const ContactStack: React.FC = () => {
  const Stack = createStackNavigator<ContactStackParams>()
  const theme = useTheme()
  const { t } = useTranslation()
  const defaultStackOptions = useDefaultStackOptions(theme)
  const [ScreenOptionsDictionary] = useServices([TOKENS.OBJECT_SCREEN_CONFIG])

  return (
    <Stack.Navigator screenOptions={{ ...defaultStackOptions }}>
      <Stack.Screen
        name={Screens.Contacts}
        component={ListContacts}
        options={{ title: t('Screens.Contacts'), ...ScreenOptionsDictionary[Screens.Contacts] }}
      />
      <Stack.Screen
        name={Screens.ContactDetails}
        component={ContactDetails}
        options={{
          title: t('Screens.ContactDetails'),
          ...ScreenOptionsDictionary[Screens.ContactDetails],
        }}
      />
      <Stack.Screen
        name={Screens.RenameContact}
        component={RenameContact}
        options={{
          title: t('Screens.RenameContact'),
          ...ScreenOptionsDictionary[Screens.RenameContact],
        }}
      />
      <Stack.Screen
        name={Screens.JSONDetails}
        component={JSONDetails}
        options={{
          title: t('Screens.JSONDetails'),
          ...ScreenOptionsDictionary[Screens.JSONDetails],
        }}
      />
      <Stack.Screen
        name={Screens.Chat}
        component={Chat}
        options={{
          ...ScreenOptionsDictionary[Screens.Chat],
        }}
      />
      <Stack.Screen
        name={Screens.WhatAreContacts}
        component={WhatAreContacts}
        options={{
          title: '',
          ...ScreenOptionsDictionary[Screens.WhatAreContacts],
        }}
      />
      <Stack.Screen
        name={Screens.CredentialDetails}
        component={CredentialDetails}
        options={{ title: t('Screens.CredentialDetails'), ...ScreenOptionsDictionary[Screens.CredentialDetails] }}
      />
      <Stack.Screen
        name={Screens.CredentialOffer}
        component={CredentialOffer}
        options={{ title: t('Screens.CredentialOffer'), ...ScreenOptionsDictionary[Screens.CredentialOffer] }}
      />
      <Stack.Screen
        name={Screens.ProofDetails}
        component={ProofDetails}
        options={() => ({
          title: '',
          headerRight: () => <HeaderRightHome />,
          ...ScreenOptionsDictionary[Screens.ProofDetails],
        })}
      />
      <Stack.Screen
        name={Screens.ProofRequest}
        component={ProofRequest}
        options={{
          title: t('Screens.ProofRequest'),
          ...ScreenOptionsDictionary[Screens.ProofRequest],
        }}
      />
    </Stack.Navigator>
  )
}

export default ContactStack
