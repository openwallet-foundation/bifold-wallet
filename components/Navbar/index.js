import React, {useState, useEffect} from 'react'

import {
  Button,
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TouchableHighlight,
  TouchableOpacity,
  View,
} from 'react-native'

import {Link} from 'react-router-native'

import AppHeaderLarge from '../AppHeaderLarge/index.js'
import LoadingOverlay from '../LoadingOverlay/index.js'

import Images from '../../assets/images'
import AppStyles from '../../assets/styles'
import Styles from './styles'

function Navbar(props) {
  return (
    <>
    {props.authenticated ? (
      <View style={Styles.navView}>
      <Link style={Styles.navButton} component={TouchableOpacity} to="/home">
        <Image source={Images.navHome} style={{width: 32, height: 28}} />
        <Text style={Styles.textSmall}>Home</Text>
      </Link>
      <Link
        style={Styles.navButton}
        component={TouchableOpacity}
        to="/contacts">
        <Image source={Images.navContacts} style={{width: 22, height: 28}} />
        <Text style={Styles.textSmall}>Contacts</Text>
      </Link>
      <Link
        style={Styles.navButton}
        component={TouchableOpacity}
        to="/workflow/connect">
        <Image
          source={Images.navConnect}
          style={{width: 38, height: 43, top: -7}}
        />
      </Link>
      <Link
        style={Styles.navButton}
        component={TouchableOpacity}
        to="/credentials">
        <Image source={Images.navCredentials} style={{width: 32, height: 28}} />
        <Text style={Styles.textSmall}>Credentials</Text>
      </Link>
      <Link
        style={Styles.navButton}
        component={TouchableOpacity}
        to="/settings">
        <Image source={Images.navSettings} style={{width: 28, height: 28}} />
        <Text style={Styles.textSmall}>Settings</Text>
      </Link>
    </View>
    ): null}
    </>
  )
}

export default Navbar