import React, {useState, useEffect} from 'react'
import {Alert, BackHandler, Image, Text, View} from 'react-native'
import {
  Prompt,
  Redirect,
  Route,
  Router,
  Switch,
  useHistory,
  useLocation,
} from 'react-router-native'

//For UUIDv4 within React Native
import 'react-native-get-random-values'
import {v4 as uuidv4} from 'uuid'

import { AgentProvider } from './components/AgentProvider/'
import Errors from './components/Errors/index.js'
import Notifications from './components/Notifications/index.js'

import CurrentContact from './components/CurrentContact/index.tsx'
import CurrentCredential from './components/CurrentCredential/index.tsx'
import EntryPoint from './components/EntryPoint/index.tsx'
import Home from './components/Home/index.tsx'
import ListContacts from './components/ListContacts/index.tsx'
import ListCredentials from './components/ListCredentials/index.tsx'
import Message from './components/Message/index.tsx'
import Navbar from './components/Navbar/index.tsx'
import PinCreate from './components/PinCreate/index.tsx'
import PinEnter from './components/PinEnter/index.tsx'
import Settings from './components/Settings/index.tsx'
import SetupWizard from './components/SetupWizard/index.tsx'
import Terms from './components/Terms/index.tsx'
import Workflow from './components/Workflow/index.tsx'

import Images from './assets/images'


import LoadingOverlay from './components/LoadingOverlay/index.js';


const App = (props) => {
  let location = useLocation()
  let history = useHistory()

  const [currentLocation, setCurrentLocation] = useState('')

  const [authenticated, setAuthenticated] = useState(false)

  // Mock data to pass to Terms component
  const mockTitle = 'Terms of Service'
  const mockMessage =
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus vel consectetur diam. Nunc sit amet elit est. Praesent libero elit, consectetur dapibus diam non, facilisis euismod velit. Etiam a ligula eget leo elementum tincidunt. Fusce et lorem turpis. Nunc tempus nisl consectetur eros vehicula venenatis. Suspendisse potenti. Aenean vitae aliquet augue. Maecenas lacinia nunc vitae blandit hendrerit. Sed congue risus quis magna convallis sollicitudin. Integer in ante vel orci ornare porta quis id libero. Proin mollis urna nec lectus fringilla, sit amet aliquam urna fringilla. Praesent pellentesque non augue et gravida. Donec congue urna ac massa consequat, lacinia condimentum dolor blandit. Nam ultrices tellus at risus dignissim, quis cursus mauris pellentesque. Donec at scelerisque ipsum. Praesent eu massa at tellus cursus ornare. Fusce vel faucibus dolor. Etiam blandit velit sed velit tempus feugiat. Donec condimentum pretium suscipit. Sed suscipit, leo molestie tempus maximus, turpis enim hendrerit nibh, semper sagittis turpis velit sed nisl. Aliquam eu ultrices velit. Aenean tristique mauris justo, eu commodo quam semper non. Curabitur ultricies auctor mi eu tempus. Sed bibendum eros sed neque semper fermentum. Nullam porta tortor ut ante congue molestie. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Curabitur sit amet aliquam nunc, malesuada auctor quam. Pellentesque vel lobortis risus, volutpat suscipit velit. Aenean ut erat sed metus interdum mattis. Nam consectetur ante eu felis rhoncus, et volutpat dolor tincidunt. Vivamus sit amet feugiat mi. Proin in dui ac metus vehicula fringilla eget id mauris. Maecenas et elit venenatis dolor pulvinar pulvinar in et leo. Aliquam scelerisque viverra sapien at bibendum. Curabitur et libero nec enim convallis porttitor sed a libero. In hac habitasse platea dictumst. Integer dignissim velit eu pharetra ultricies. Vestibulum at velit hendrerit, pretium purus eget, lobortis tellus. Maecenas non erat ut lacus scelerisque luctus et et tellus.'
  const mockEulaTitle = 'EULA Agreement'
  const mockEulaMessage =
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus vel consectetur diam. Nunc sit amet elit est. Praesent libero elit, consectetur dapibus diam non, facilisis euismod velit. Etiam a ligula eget leo elementum tincidunt. Fusce et lorem turpis. Nunc tempus nisl consectetur eros vehicula venenatis. Suspendisse potenti. Aenean vitae aliquet augue. Maecenas lacinia nunc vitae blandit hendrerit. Sed congue risus quis magna convallis sollicitudin. Integer in ante vel orci ornare porta quis id libero. Proin mollis urna nec lectus fringilla, sit amet aliquam urna fringilla. Praesent pellentesque non augue et gravida. Donec congue urna ac massa consequat, lacinia condimentum dolor blandit. Nam ultrices tellus at risus dignissim, quis cursus mauris pellentesque. Donec at scelerisque ipsum. Praesent eu massa at tellus cursus ornare. Fusce vel faucibus dolor. Etiam blandit velit sed velit tempus feugiat. Donec condimentum pretium suscipit. Sed suscipit, leo molestie tempus maximus, turpis enim hendrerit nibh, semper sagittis turpis velit sed nisl. Aliquam eu ultrices velit. Aenean tristique mauris justo, eu commodo quam semper non. Curabitur ultricies auctor mi eu tempus. Sed bibendum eros sed neque semper fermentum. Nullam porta tortor ut ante congue molestie. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Curabitur sit amet aliquam nunc, malesuada auctor quam. Pellentesque vel lobortis risus, volutpat suscipit velit. Aenean ut erat sed metus interdum mattis. Nam consectetur ante eu felis rhoncus, et volutpat dolor tincidunt. Vivamus sit amet feugiat mi. Proin in dui ac metus vehicula fringilla eget id mauris. Maecenas et elit venenatis dolor pulvinar pulvinar in et leo. Aliquam scelerisque viverra sapien at bibendum. Curabitur et libero nec enim convallis porttitor sed a libero. In hac habitasse platea dictumst. Integer dignissim velit eu pharetra ultricies. Vestibulum at velit hendrerit, pretium purus eget, lobortis tellus. Maecenas non erat ut lacus scelerisque luctus et et tellus.'

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

  /*
    /
    /home
    /start
    /pin-entry
    /pin-create
    /scan
    /workflow
    /settings
  */

  return (
    <View>
      <AgentProvider>
        <Errors>
          <Notifications>
            <View style={authenticated ? {height: '90.5%'} : {height: '100%'}}>
              <Route
                exact
                path="/"
                render={() => {
                  return <EntryPoint authenticated={authenticated} />
                }}
              />
              <Route
                exact
                path="/home"
                render={() => (authenticated ? <Home /> : <Redirect to="/" />)}
              />
              <Route
                exact
                path="/settings"
                render={() =>
                  authenticated ? <Settings /> : <Redirect to="/" />
                }
              />
              <Route
                exact
                path="/contacts"
                render={() =>
                  authenticated ? (
                    <ListContacts contacts={mockContacts} />
                  ) : (
                    <Redirect to="/" />
                  )
                }
              />
              <Route
                exact
                path="/credentials"
                render={() =>
                  authenticated ? (
                    <ListCredentials credentials={mockCredentials} />
                  ) : (
                    <Redirect to="/" />
                  )
                }
              />
              <Route
                path="/workflow"
                render={() => 
                <Workflow 
                  authenticated={authenticated} 
                  contacts={mockContacts} 
                  credentials={mockCredentials}
                />}
              />
              <Route
                exact
                path="/pin/enter"
                render={() => <PinEnter setAuthenticated={setAuthenticated} />}
              />
              <Route
                exact
                path="/pin/create"
                render={() => <PinCreate setAuthenticated={setAuthenticated} />}
              />
              <Route
                exact
                path="/setup-wizard"
                render={() => (
                  <SetupWizard setAuthenticated={setAuthenticated}>
                    <Terms title={mockTitle} message={mockMessage} />
                    <Terms title={mockEulaTitle} message={mockEulaMessage} />
                    <PinCreate />
                  </SetupWizard>
                )}
              />
            </View>
            {authenticated ? (
              <View style={{height: '10%'}}>
                <Navbar authenticated={authenticated} />
              </View>
            ) : null}
          </Notifications>
        </Errors>
      </AgentProvider>
    </View>
  )
}

export default App
