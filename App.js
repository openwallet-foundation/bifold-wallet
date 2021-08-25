import React, { useState } from 'react'
import { View } from 'react-native'

//For UUIDv4 within React Native
import 'react-native-get-random-values'

import { AgentProvider } from './App/contexts/AgentProvider'
import Errors from './App/contexts/Errors'
import Notifications from './App/contexts/Notifications'

import TabNavigator from './App/navigators/TabNavigator'
import AuthenticateStack from './App/navigators/AuthenticateStack'

const App = () => {
  const [authenticated, setAuthenticated] = useState(false)

  // Mock Credentials
  const mockCredentials = [
    {
      label: 'COVID-19 Vaccination',
      sublabel: 'General Health Clinic',
      first_name: 'John',
      last_name: 'Doe',
      credential_date: 'Jan 28, 2021',
      cred_id: 1234567,
    },
    {
      label: 'COVID-19 Test',
      sublabel: 'General Testing Clinic',
      first_name: 'John',
      last_name: 'Doe',
      credential_date: 'Oct 29, 2020',
      cred_id: 1234321,
    },
  ]

  // Mock Contacts
  const mockContacts = [
    {
      label: 'General Health Clinic',
      sublabel: 'Vaccine Administrator',
      address: '123 ABC Street',
      phone: '505-555-1234',
      email: 'genhealthclinic@credential.com',
      contact_id: 7654321,
    },
    {
      label: 'General Testing Clinic',
      sublabel: 'Test Distributer',
      address: '456 DEF Street',
      phone: '123-555-4321',
      email: 'gentestclinic@credential.com',
      contact_id: 7654567,
    },
  ]

  return (
    <AgentProvider>
      <Errors>
        <Notifications>
          <View style={{ height: '100%' }}>
            {authenticated ? <TabNavigator /> : <AuthenticateStack setAuthenticated={setAuthenticated} />}
          </View>
        </Notifications>
      </Errors>
    </AgentProvider>
  )
}

export default App
