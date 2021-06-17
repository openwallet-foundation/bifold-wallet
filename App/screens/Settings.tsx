import React, { useState, useEffect, useContext } from 'react'

import { Image, SafeAreaView, ScrollView, StatusBar, Text, TouchableOpacity, View, StyleSheet } from 'react-native'

import { useHistory } from 'react-router-native'

import { AppHeader, BackButton } from 'components'

import { ErrorsContext } from '../contexts/Errors'

import AppStyles from '../../assets/styles'
import Images from '../../assets/images'

function Settings() {
  const history = useHistory()

  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      {/* <BackButton backPath={'/home'} /> */}
      {/* <View style={AppStyles.viewFull}> */}
      {/* <View style={AppStyles.header}>
          <AppHeader headerText={'SETTINGS'} />
        </View>
        <View style={Styles.settingView}>
          <TouchableOpacity
            style={Styles.backbutton}
            hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
            onPress={() => history.push('/home')}
          >
            <Image source={Images.arrowDown} style={AppStyles.arrow} />
          </TouchableOpacity> */}
      <Text style={[AppStyles.textSecondary, AppStyles.h3]}>
        <Text style={AppStyles.textBold}>Version: </Text> 0.0.1
      </Text>
      <Text style={[AppStyles.textSecondary, AppStyles.h3]}>
        <Text style={AppStyles.textBold}>AMA-RN Version: </Text> 0.1.0
      </Text>
      {/* </View> */}
      {/* </View> */}
    </View>
  )
}

export default Settings

const styles = StyleSheet.create({
  backbutton: {
    marginBottom: 30,
  },
  settingView: {
    alignItems: 'center',
  },
})
