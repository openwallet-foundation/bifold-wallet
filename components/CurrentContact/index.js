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

function CurrentContact(props) {
  let history = useHistory()

  return (
    <View style={AppStyles.viewFull}>
      <View style={AppStyles.header}>
        <AppHeader headerText={'CONTACTS'} />
      </View>
      <View style={Styles.credView}>
        <TouchableOpacity
          style={Styles.backbutton}
          hitSlop={{top: 20, bottom: 20, left: 20, right: 20}}
          onPress={() => props.setViewContact(true)}>
          <Image source={Images.arrowDown} style={AppStyles.arrow} />
        </TouchableOpacity>
        {props.contact ? (
          <>
            <View
              style={[
                AppStyles.tableItem,
                Styles.tableItem,
                {backgroundColor: '#0A1C40'},
              ]}>
              <View>
                <Text
                  style={[
                    {fontSize: 18},
                    AppStyles.textWhite,
                    AppStyles.textUpper,
                  ]}>
                  {props.contact.label}
                </Text>
                <Text style={[{fontSize: 14}, AppStyles.textWhite]}>
                  {props.contact.sublabel}
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
                    AppStyles.textBlueDark,
                    AppStyles.textUpper,
                  ]}>
                  <Text style={AppStyles.textBold}>Address: </Text>
                  {props.contact.address}
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
                    AppStyles.textBlueDark,
                    AppStyles.textUpper,
                  ]}>
                  <Text style={AppStyles.textBold}>Phone: </Text>
                  {props.contact.phone}
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
                    AppStyles.textBlueDark,
                  ]}>
                  <Text style={AppStyles.textBold}>Email: </Text>
                  {props.contact.email}
                </Text>
              </View>
            </View>
          </>
        ) : null}
      </View>
    </View>
  )
}

export default CurrentContact
