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

import {Prompt, useHistory} from 'react-router-native'

import Images from '../../assets/images'
import AppStyles from '../../assets/styles'
import Styles from './styles'

interface AppHeaderProps {
  headerText?: string
}

function AppHeader (props: AppHeaderProps) {
  let history = useHistory()

  return (
    <View style={Styles.header}>
      <TouchableOpacity
        onPress={() => {
          history.push('/home')
        }}>
        <View style={Styles.headerView}>
          {props.headerText ? (
            <>
              <Image source={Images.logo} style={{marginRight: 10}} />
              <Text
                style={[
                  AppStyles.h1,
                  AppStyles.textSecondary,
                  Styles.textBorder,
                  AppStyles.textUpper,
                ]}>
                {props.headerText}
              </Text>
            </>
          ) : (
            <Image source={Images.logoText} style={{}} />
          )}
        </View>
      </TouchableOpacity>
    </View>
  )
}

export default AppHeader
