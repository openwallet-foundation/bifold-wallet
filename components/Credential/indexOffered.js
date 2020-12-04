import React, {useState, useEffect, useContext} from 'react'

import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'

import {useHistory} from 'react-router-native'

import AppHeader from '../AppHeader/index.js'
import LoadingOverlay from '../LoadingOverlay/index.js'

import {ErrorsContext} from '../Errors/index.js'
import {NotificationsContext} from '../Notifications/index.js'

import Images from '../../assets/images'
import Styles from './styles'
import AppStyles from '../../assets/styles'

function CredentialOffered() {
  let history = useHistory()

  const errors = useContext(ErrorsContext)
  const notifications = useContext(NotificationsContext)

  return (
    <View style={AppStyles.viewFull}>
      <View style={AppStyles.header}>
        <AppHeader headerText={'CREDENTIALS'} />
      </View>
      <View style={[AppStyles.tab, Styles.tabView]}>
        <Text
          style={[AppStyles.h3, AppStyles.textBlueDark, AppStyles.textUpper]}>
          Connected to:
        </Text>
        <View style={AppStyles.tableItem}>
          <View>
            <Text
              style={[
                {fontSize: 18},
                AppStyles.textBlueDark,
                AppStyles.textUpper,
              ]}>
              Company
            </Text>
            <Text style={[{fontSize: 14}, AppStyles.textBlueDark]}>
              Credential offered from this company
            </Text>
          </View>
          <Text style={[Styles.icon, AppStyles.textBlueDark]}>?</Text>
        </View>
        <View style={AppStyles.tableItem}>
          <View>
            <Text
              style={[
                {fontSize: 18},
                AppStyles.textBlueDark,
                AppStyles.textUpper,
              ]}>
              Credential
            </Text>
            <Text style={[{fontSize: 14}, AppStyles.textBlueDark]}>
              Credential offered from this company
            </Text>
          </View>
          <Text style={[Styles.icon, AppStyles.textBlueDark]}>?</Text>
        </View>
        <View style={Styles.buttonWrap}>
          <Text
            style={[
              {fontSize: 18},
              AppStyles.textBlueDark,
              AppStyles.textUpper,
              Styles.buttonText,
            ]}>
            ACCEPT CREDENTIALS
          </Text>
          <TouchableOpacity style={[Styles.button, AppStyles.buttonGreen]}>
            <Text
              style={[
                AppStyles.h2,
                AppStyles.textWhite,
                AppStyles.textBold,
                AppStyles.rotate90,
              ]}>
              &#10132;
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

export default CredentialOffered
