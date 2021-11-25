import { createStackNavigator } from '@react-navigation/stack'
import React from 'react'
import { StyleSheet } from 'react-native'
import { SvgProps } from 'react-native-svg'

import WelcomeOne from '../assets/img/welcome-1.svg'
import WelcomeTwo from '../assets/img/welcome-2.svg'
import { Colors, ButtonStyles } from '../globalStyles'
import ContactDetails from '../screens/ContactDetails'
// import ListContacts from '../screens/ListContacts'
import Onboarding from '../screens/Onboarding'

import defaultStackOptions from './defaultStackOptions'

// @ts-ignore
// @ts-ignore

export type ContactStackParams = {
  Contacts: undefined
  'Contact Details': { connectionId: string }
}

const Stack = createStackNavigator<ContactStackParams>()

// TEMPORARILY HERE - START
const title = 'Ontario Wallet'
const pages: { image: React.FC<SvgProps>; text: string }[] = [
  {
    image: WelcomeOne,
    text: 'Lorem 1 ipsum dolor sit amet, consectetur adipiscing elit.',
  },
  {
    image: WelcomeTwo,
    text: 'Lorem 2 ipsum dolor sit amet, consectetur adipiscing elit.',
  },
]

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  controlsContainer: {
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 32,
  },
  headerText: {
    fontWeight: 'bold',
    fontSize: 32,
    color: Colors.textColor,
  },
  bodyText: {
    fontWeight: 'normal',
    fontSize: 32,
    textAlign: 'center',
    margin: 16,
    color: Colors.textColor,
  },
  primaryButton: ButtonStyles.primary,
  primaryButtonText: ButtonStyles.primaryText,
})

const markTutorialFin = async () => {
  // Here is where we make a permanent record the user has
  // completed the on-boarding process. We can use this record
  // next time they open the app so they do not repeat the
  // process.
  // import { setTutorialCompletionStatus } from '../utils/storage'
  // await setTutorialCompletionStatus(true)
  // navigation.navigate('Home')
}

// TEMPORARILY HERE - END

const ContactStack = () => {
  return (
    <Stack.Navigator screenOptions={{ ...defaultStackOptions, headerShown: false }}>
      <Stack.Screen name="Contacts">
        {(props) => (
          <Onboarding {...props} title={title} pages={pages} onOnboardingDismissed={markTutorialFin} style={styles} />
        )}
      </Stack.Screen>
      <Stack.Screen name="Contact Details" component={ContactDetails} />
    </Stack.Navigator>
  )
}

export default ContactStack
