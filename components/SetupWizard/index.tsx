import React, {useState, useEffect, useContext} from 'react'

import {
  Alert,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'

import {useHistory} from 'react-router-native'

import * as Keychain from 'react-native-keychain'

import BackButton from '../BackButton/index'
import LoadingOverlay from '../LoadingOverlay/index'
import Message from '../Message/index'

import AppStyles from '../../assets/styles'
import Styles from './styles'
import Images from '../../assets/images'

import { NotificationsContext } from '../Notifications/index'

interface ISetupWizard {

  children: JSX.Element[]

}

function SetupWizard(props: ISetupWizard) {
  let history = useHistory()

  const notifications = useContext(NotificationsContext)

  const [setupScreens, setSetupScreens] = useState(-1)

  console.log('The current setup value is ', setupScreens)

  useEffect(() => {
    //check number in keychain, setSetupScreens
    const storeWizard = async () => {
      let checker = await Keychain.getGenericPassword({service: 'setupWizard'})
      const currentScreen = '0'
      const setupComplete = 'false'
      if (!checker) {
        await Keychain.setGenericPassword(currentScreen, setupComplete, {
          service: 'setupWizard',
        })
        setSetupScreens(0)
      } else {
        console.log('working?', checker.username.toString())
        setSetupScreens(parseInt(checker.username, 10))
      }
      console.log('we got this far')
      console.log('False here', checker)
      checker = await Keychain.getGenericPassword({service: 'setupWizard'})
      console.log('True here', checker)
    }
    storeWizard()
  }, [])

  useEffect(() => {
    const wizardUpdate = async () => {
      let setupComplete = 'false'
      let currentScreen = setupScreens.toString()
      if (setupScreens >= props.children.length) {
        props.setAuthenticated(true)
        setupComplete = 'true'
        history.push('home')
      }
      await Keychain.resetGenericPassword({service: 'setupWizard'})
      await Keychain.setGenericPassword(currentScreen, setupComplete, {
        service: 'setupWizard',
      })
      let checker = await Keychain.getGenericPassword({service: 'setupWizard'})
      console.log('Lower part, check?', checker)

      /*
      Is the setup complete? Set setupComplete to true or false
      Update keychain with  
      */
    }
    wizardUpdate()
  }, [setupScreens])

  return (
    <>
      <BackButton backExit={true} />
      {setupScreens < 0 || setupScreens >= props.children.length ? (
        <LoadingOverlay />
      ) : (
        <View style={AppStyles.viewFull}>
          <KeyboardAvoidingView behavior={'height'} style={{height: '92%'}}>
            {React.cloneElement(props.children[setupScreens], {
              setupScreens: setupScreens,
              setSetupScreens: setSetupScreens,
            })}
          </KeyboardAvoidingView>
          <View style={Styles.dotContainer}>
            {props.children.map((child, index) => {
              let dotStyle = [Styles.dot]
              if (index <= setupScreens) {
                dotStyle.push(AppStyles.backgroundPrimary)
              }
              return <View key={index} style={dotStyle} />
            })}
          </View>
        </View>
      )}
    </>
  )
}

export default SetupWizard
