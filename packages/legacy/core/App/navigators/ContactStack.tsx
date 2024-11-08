import { createStackNavigator } from '@react-navigation/stack'
import React from 'react'
import { useTranslation } from 'react-i18next'

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
  const [
    ContactHeaderRight,
    ContactDetailsHeaderRight,
    RenameContactHeaderRight,
    ContactChatHeaderRight,
    WhatAreContactHeaderRight,
    CredentialDetailsHeaderRight,
    CredentialOfferHeaderRight,
    DetailsProofHeaderRight,
    ProofRequestHeaderRight
  ] = useServices([
    TOKENS.COMPONENT_CONTACT_LIST_HEADER_RIGHT,
    TOKENS.COMPONENT_CONTACT_DETAILS_LIST_HEADER_RIGHT,
    TOKENS.COMPONENT_CONTACT_RENAME_HEADER_RIGHT,
    TOKENS.COMPONENT_CONTACT_CHAT_HEADER_RIGHT,
    TOKENS.COMPONENT_CONTACT_WHAT_ARE_HEADER_RIGHT,
    TOKENS.COMPONENT_CONTACT_DETAILS_CRED_HEADER_RIGHT,
    TOKENS.COMPONENT_CONTACT_OFFER_CRED_HEADER_RIGHT,
    TOKENS.COMPONENT_CONTACT_DETAILS_PROOF_HEADER_RIGHT,
    TOKENS.COMPONENT_CONTACT_REQUEST_PROOF_HEADER_RIGHT
  ])

  return (
    <Stack.Navigator screenOptions={{ ...defaultStackOptions }}>
      <Stack.Screen 
        name={Screens.Contacts}
        component={ListContacts}
        options={{ 
          title: t('Screens.Contacts'),
          headerRight: () => <ContactHeaderRight />,
        }}
      />
      <Stack.Screen
        name={Screens.ContactDetails}
        component={ContactDetails}
        options={{
          title: t('Screens.ContactDetails'),
          headerRight: () => <ContactDetailsHeaderRight />,
        }}
      />
      <Stack.Screen
        name={Screens.RenameContact}
        component={RenameContact}
        options={() => ({ 
          title: t('Screens.RenameContact'),
          headerRight: () => <RenameContactHeaderRight />,
      })}
      />
      <Stack.Screen name={Screens.Chat} component={Chat}
        options={{ 
          title: '',
          headerRight: () => <ContactChatHeaderRight />,}}
      />
      <Stack.Screen name={Screens.WhatAreContacts} component={WhatAreContacts}
        options={{ 
          title: '',
          headerRight: () => <WhatAreContactHeaderRight />,}}
      />
      <Stack.Screen
        name={Screens.CredentialDetails}
        component={CredentialDetails}
        options={() => ({ 
          title: t('Screens.CredentialDetails'),
          headerRight: () => <CredentialDetailsHeaderRight />,
      })}
      />
      <Stack.Screen
        name={Screens.CredentialOffer}
        component={CredentialOffer}
        options={() => ({ 
          title: t('Screens.CredentialOffer'),
          headerRight: () => <CredentialOfferHeaderRight />,
        })}
      />
      <Stack.Screen
        name={Screens.ProofDetails}
        component={ProofDetails}
        options={() => ({
          title: '',
          headerRight: () => <DetailsProofHeaderRight />,
        })}
      />
      <Stack.Screen
        name={Screens.ProofRequest}
        component={ProofRequest}
        options={() => ({  title: t('Screens.ProofRequest'),
        headerRight: () => <ProofRequestHeaderRight />,
      })}
      />
    </Stack.Navigator>
  )
}

export default ContactStack
