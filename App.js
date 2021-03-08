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

import Errors from './components/Errors/index.tsx'
import Notifications from './components/Notifications/index.tsx'

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
// import AMARN from './aries-mobileagent-react-native'

import { downloadGenesis, storeGenesis } from './genesis-utils'
import { HttpOutboundTransporter, PollingInboundTransporter } from './transporters'
import { Agent, InboundTransporter, OutboundTransporter, InitConfig } from 'aries-framework-javascript'
import indy from 'rn-indy-sdk'
import LoadingOverlay from './components/LoadingOverlay/index.js';


const App = (props) => {
  let location = useLocation()
  let history = useHistory()

  const [loading, setLoading] = useState(true)
  const [agent, setAgent] = useState(false)

  async function walletCreation() {
      console.log("Creating new wallet...")
      const newWallet = await indy.createWallet({ id: 'wallet-123' }, { key: 'key' })
      const openedWallet = await indy.openWallet({ id: 'wallet-123' }, { key: 'key' })
      console.log('The new wallet is: ', openedWallet)
  }

  // walletCreation()

  useEffect(() => {
    // const agentTest = async () => {
    //   //Optional Library Generation of a MasterSecretID
    //   const masterSecretID = await AMARN.generateMasterSecretID()

    //   const walletName = uuidv4()
    //   //Must ask for permissions prior to creation for custom permission messages
    //   await AMARN.createAgent(
    //     {
    //       walletName: walletName/*"SampleWallet"*/,
    //       walletPassword: "SamplePassword",
    //       masterSecretID: masterSecretID,
    //       ledgerConfig: {
    //         name: "Indicio-TestNet",
    //         genesisString: `{"reqSignature":{},"txn":{"data":{"data":{"alias":"OpsNode","blskey":"4i39oJqm7fVX33gnYEbFdGurMtwYQJgDEYfXdYykpbJMWogByocaXxKbuXdrg3k9LP33Tamq64gUwnm4oA7FkxqJ5h4WfKH6qyVLvmBu5HgeV8Rm1GJ33mKX6LWPbm1XE9TfzpQXJegKyxHQN9ABquyBVAsfC6NSM4J5t1QGraJBfZi","blskey_pop":"Qq3CzhSfugsCJotxSCRAnPjmNDJidDz7Ra8e4xvLTEzQ5w3ppGray9KynbGPH8T7XnUTU1ioZadTbjXaRY26xd4hQ3DxAyR4GqBymBn3UBomLRJHmj7ukcdJf9WE6tu1Fp1EhxmyaMqHv13KkDrDfCthgd2JjAWvSgMGWwAAzXEow5","client_ip":"13.58.197.208","client_port":"9702","node_ip":"3.135.134.42","node_port":"9701","services":["VALIDATOR"]},"dest":"EVwxHoKXUy2rnRzVdVKnJGWFviamxMwLvUso7KMjjQNH"},"metadata":{"from":"Pms5AZzgPWHSj6nNmJDfmo"},"type":"0"},"txnMetadata":{"seqNo":1,"txnId":"77ad6682f320be9969f70a37d712344afed8e3fba8d43fa5602c81b578d26088"},"ver":"1"}
    //         {"reqSignature":{},"txn":{"data":{"data":{"alias":"cynjanode","blskey":"32DLSweyJRxVMcVKGjUeNkVF1fwyFfRcFqGU9x7qL2ox2STpF6VxZkbxoLkGMPnt3gywRaY6jAjqgC8XMkf3webMJ4SEViPtBKZJjCCFTf4tGXfEsMwinummaPja85GgTALf7DddCNyCojmkXWHpgjrLx3626Z2MiNxVbaMapG2taFX","blskey_pop":"RQRU8GVYSYZeu9dfH6myhzZ2qfxeVpCL3bTzgto1bRbx3QCt3mFFQQBVbgrqui2JpXhcWXxoDzp1WyYbSZwYqYQbRmvK7PPG82VAvVagv1n83Qa3cdyGwCevZdEzxuETiiXBRWSPfb4JibAXPKkLZHyQHWCEHcAEVeXtx7FRS1wjTd","client_ip":"3.17.103.221","client_port":"9702","node_ip":"3.17.215.226","node_port":"9701","services":["VALIDATOR"]},"dest":"iTq944JTtwHnst7rucfsRA4m26x9i6zCKKohETBCiWu"},"metadata":{"from":"QC174PGaL4zA9YHYqofPH2"},"type":"0"},"txnMetadata":{"seqNo":2,"txnId":"ce7361e44ec10a275899ece1574f6e38f2f3c7530c179fa07a2924e55775759b"},"ver":"1"}
    //         {"reqSignature":{},"txn":{"data":{"data":{"alias":"GlobaliD","blskey":"4Behdr1KJfLTAPNospghtL7iWdCHca6MZDxAtzYNXq35QCUr4aqpLu6p4Sgu9wNbTACB3DbwmVgE2L7hX6UsasuvZautqUpf4nC5viFpH7X6mHyqLreBJTBH52tSwifQhRjuFAySbbfyRK3wb6R2Emxun9GY7MFNuy792LXYg4C6sRJ","blskey_pop":"RKYDRy8oTxKnyAV3HocapavH2jkw3PVe54JcEekxXz813DFbEy87N3i3BNqwHB7MH93qhtTRb7EZMaEiYhm92uaLKyubUMo5Rqjve2jbEdYEYVRmgNJWpxFKCmUBa5JwBWYuGunLMZZUTU3qjbdDXkJ9UNMQxDULCPU5gzLTy1B5kb","client_ip":"13.56.175.126","client_port":"9702","node_ip":"50.18.84.131","node_port":"9701","services":["VALIDATOR"]},"dest":"2ErWxamsNGBfhkFnwYgs4UW4aApct1kHUvu7jbkA1xX4"},"metadata":{"from":"4H8us7B1paLW9teANv8nam"},"type":"0"},"txnMetadata":{"seqNo":3,"txnId":"0c3b33b77e0419d6883be35d14b389c3936712c38a469ac5320a3cae68be1293"},"ver":"1"}
    //         {"reqSignature":{},"txn":{"data":{"data":{"alias":"IdRamp","blskey":"LoYzqUMPDZEfRshwGSzkgATxcM5FAS1LYx896zHnMfXP7duDsCQ6CBG2akBkZzgH3tBMvnjhs2z7PFc2gFeaKUF9fKDHhtbVqPofxH3ebcRfA959qU9mgvmkUwMUgwd21puRU6BebUwBiYxMxcE5ChReBnAkdAv19gVorm3prBMk94","blskey_pop":"R1DjpsG7UxgwstuF7WDUL17a9Qq64vCozwJZ88bTrSDPwC1cdRn3WmhqJw5LpEhFQJosDSVVT6tS8dAZrrssRv2YsELbfGEJ7ZGjhNjZHwhqg4qeustZ7PZZE3Vr1ALSHY4Aa6KpNzGodxu1XymYZWXAFokPAs3Kho8mKcJwLCHn3h","client_ip":"199.66.14.126","client_port":"9702","node_ip":"199.66.14.103","node_port":"9701","services":["VALIDATOR"]},"dest":"5Zj5Aec6Kt9ki1runrXu87wZ522mnm3zwmaoHLUcHLx9"},"metadata":{"from":"AFLDFPoJuDQUHqnfmg8U7i"},"type":"0"},"txnMetadata":{"seqNo":4,"txnId":"c9df105558333ac8016610d9da5aad1e9a5dd50b9d9cc5684e94f439fa10f836"},"ver":"1"}`
    //       },
    //       defaultMediatorConfig: {
    //         invite: "http://mediator2.test.indiciotech.io?c_i=eyJAdHlwZSI6ICJkaWQ6c292OkJ6Q2JzTlloTXJqSGlxWkRUVUFTSGc7c3BlYy9jb25uZWN0aW9ucy8xLjAvaW52aXRhdGlvbiIsICJAaWQiOiAiZjRhYmIxZTUtNzEwNS00ODg1LTk1MDEtMWI4YWI0YzQ4MDRiIiwgImxhYmVsIjogIkluZGljaW8gUHVibGljIE1lZGlhdG9yIiwgInJlY2lwaWVudEtleXMiOiBbIjdXY1FReFg3MmFNc2tHeXIzWGZKNmJhNXhnZDVlN20yUENhTEdIekV2ZzljIl0sICJzZXJ2aWNlRW5kcG9pbnQiOiAiaHR0cDovL21lZGlhdG9yMi50ZXN0LmluZGljaW90ZWNoLmlvIn0=",
    //         mediatorID: "indicio-public-mediator"
    //       },
    //     }
    //   )
    // }
    // // agentTest()


    const initAgent = async () => {

      let agentConfig={
        mediatorUrl: 'https://72ee1a01122b.ngrok.io',
        genesisUrl: 'http://dev.greenlight.bcovrin.vonx.io/genesis',
      }
  
      let genesisPath = agentConfig.genesisPath
      const genesis = await downloadGenesis(agentConfig.genesisUrl)
      genesisPath = await storeGenesis(genesis, 'genesis.txn')
  
      const inbound = new PollingInboundTransporter()
      const outbound = new HttpOutboundTransporter()
  
      agentConfig = {
        label: 'javascript',
        walletConfig: { id: 'wallet2' },
        walletCredentials: { key: '123' },
        autoAcceptConnections: true,
        poolName: 'test-183',
        ...agentConfig,
        genesisPath,
      }
  
  
      const newAgent = new Agent(agentConfig, inbound, outbound, indy)
      // eslint-disable-next-line no-console
      console.log('agent instance created')
      await newAgent.init()
  
      console.log('---------NEW AGENT HAS BEEN CREATED: ', newAgent)
  
      setLoading(false)
      setAgent(true)

    }

    if(!agent) {
      console.log('----------------------------- AGENT IS BEING CALLED -----------------------------')
      try {
        initAgent()
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn(e)
      }
    }

  }, [])

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
              render={() => (
                <Workflow
                  authenticated={authenticated}
                  contacts={mockContacts}
                  credentials={mockCredentials}
                />
              )}
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
    </View>
  )
}

export default App
