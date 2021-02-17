import React, {useState, useEffect, useContext} from 'react'

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

import AppHeader from '../AppHeader/index.js'

import {ErrorsContext} from '../Errors/index.js'

import AppStyles from '../../assets/styles'
import Images from '../../assets/images.js'
import Styles from './styles'

function CurrentCredential(props) {
  let history = useHistory()

  return (
    <View style={AppStyles.viewFull}>
      <View style={AppStyles.header}>
        <AppHeader headerText={'CREDENTIALS'} />
      </View>
      <View style={[AppStyles.credView, AppStyles.backgroundWhite]}>
        <TouchableOpacity
          style={AppStyles.backbutton}
          hitSlop={{top: 20, bottom: 20, left: 20, right: 20}}
          onPress={() => props.setViewCredential(true)}>
          <Image source={Images.arrowDown} style={AppStyles.arrow} />
        </TouchableOpacity>
        {props.credential ? (
          <>
            <View
              style={[
                AppStyles.tableItem,
                AppStyles.tableListItem,
                AppStyles.backgroundSecondary,
              ]}>
              <View>
                <Text
                  style={[
                    {fontSize: 18},
                    AppStyles.textWhite,
                    AppStyles.textUpper,
                  ]}>
                  {props.credential.label}
                </Text>
                <Text style={[{fontSize: 14}, AppStyles.textWhite]}>
                  {props.credential.sublabel}
                </Text>
              </View>
            </View>
            <View
              style={[
                AppStyles.tableItem,
                Styles.tableItem,
                Styles.tableSubItem,
              ]}>
              <View>
                <Text
                  style={[
                    {fontSize: 18},
                    AppStyles.textSecondary,
                    AppStyles.textUpper,
                  ]}>
                  <Text style={AppStyles.textBold}>Name: </Text>
                  {props.credential.first_name} {props.credential.last_name}
                </Text>
              </View>
            </View>
            <View
              style={[
                AppStyles.tableItem,
                Styles.tableItem,
                Styles.tableSubItem,
              ]}>
              <View>
                <Text
                  style={[
                    {fontSize: 18},
                    AppStyles.textSecondary,
                    AppStyles.textUpper,
                  ]}>
                  <Text style={AppStyles.textBold}>Date Received: </Text>
                  {props.credential.credential_date}
                </Text>
              </View>
            </View>
          </>
        ) : null}
      </View>
    </View>
  )
}

export default CurrentCredential
