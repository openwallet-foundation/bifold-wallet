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
import WhatAreContacts from '../screens/WhatAreContacts'
import { ContactStackParams, Screens } from '../types/navigators'

import { useDefaultStackOptions } from './defaultStackOptions'
import { TOKENS, useServices } from '../container-api'

const ContactStack: React.FC = () => {
  const Stack = createStackNavigator<ContactStackParams>()
  const theme = useTheme()
  const { t } = useTranslation()
  const defaultStackOptions = useDefaultStackOptions(theme)
  const [ContactListHeaderRignht] = useServices([TOKENS.COMPONENT_CONTACT_LIST_HEADER_RIGHT])

  return (
    <Stack.Navigator screenOptions={{ ...defaultStackOptions }}>
      <Stack.Screen name={Screens.Contacts} component={ListContacts}
        options={{ 
          title: t('Screens.Contacts'),
          headerRight: () => <ContactListHeaderRignht />,
        }}
      />
      <Stack.Screen
        name={Screens.ContactDetails}
        component={ContactDetails}
        options={{
          title: t('Screens.ContactDetails'),
          headerRight: () => <ContactListHeaderRignht />,
        }}
      />
      <Stack.Screen
        name={Screens.RenameContact}
        component={RenameContact}
        options={() => ({ 
          title: t('Screens.RenameContact'),
          headerRight: () => <ContactListHeaderRignht />,
      })}
      />
      <Stack.Screen name={Screens.Chat} component={Chat}
        options={{ 
          title: '',
          headerRight: () => <ContactListHeaderRignht />,}}
      />
      <Stack.Screen name={Screens.WhatAreContacts} component={WhatAreContacts}
        options={{ 
          title: '',
          headerRight: () => <ContactListHeaderRignht />,}}
      />
      <Stack.Screen
        name={Screens.CredentialDetails}
        component={CredentialDetails}
        options={() => ({ 
          title: t('Screens.CredentialDetails'),
          headerRight: () => <ContactListHeaderRignht />,
      })}
      />
      <Stack.Screen
        name={Screens.CredentialOffer}
        component={CredentialOffer}
        options={() => ({ 
          title: t('Screens.CredentialOffer'),
          headerRight: () => <ContactListHeaderRignht />,
        })}
      />
      <Stack.Screen
        name={Screens.ProofDetails}
        component={ProofDetails}
        options={() => ({
          title: '',
          headerRight: () => <ContactListHeaderRignht />,
        })}
      />
      <Stack.Screen
        name={Screens.ProofRequest}
        component={ProofRequest}
        options={() => ({  title: t('Screens.ProofRequest'),
        headerRight: () => <ContactListHeaderRignht />,
      })}
      />
    </Stack.Navigator>
  )
}

export default ContactStack
