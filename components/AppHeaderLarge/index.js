import React, {useState, useEffect} from 'react'

import {
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'

import {useHistory} from 'react-router-native'

import Images from '../../assets/images'
import AppStyles from '../../assets/styles'
import Styles from './styles'

function AppHeaderLarge(props) {
  let history = useHistory()

  return (
    <View style={Styles.headerLarge}>
      <TouchableOpacity
        onPress={() => {
          history.push('/home')
        }}
        disabled={props.disabled ? true : false}>
        <Image source={Images.logoLarge} />
      </TouchableOpacity>
    </View>
  )
}

export default AppHeaderLarge
