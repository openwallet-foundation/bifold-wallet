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
          <Link
            style={Styles.navButton}
            component={TouchableOpacity}
            to="/home">
            <Image source={Images.navHome} />
            <Text>Home</Text>
          </Link>
          <Link
            style={Styles.navButton}
            component={TouchableOpacity}
            to="/credentials">
            <Image source={Images.navCredential} />
            <Text>Credentials</Text>
          </Link>
          <Link
            style={Styles.navButton}
            component={TouchableOpacity}
            to="/workflow/connect">
            <Image
              source={Images.navAdd}
              style={{width: 50, height: 50, top: -5}}
            />
          </Link>
          <Link
            style={Styles.navButton}
            component={TouchableOpacity}
            to="/contacts">
            <Image source={Images.navContact} />
            <Text>Contacts</Text>
          </Link>
          <Link
            style={Styles.navButton}
            component={TouchableOpacity}
            to="/settings">
            <Image source={Images.navSetting} />
            <Text>Settings</Text>
          </Link>
        </View>
      ) : null}
    </>
  )
}

export default Navbar
