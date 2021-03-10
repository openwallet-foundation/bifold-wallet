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

import AppHeader from '../AppHeader/index'

import {ErrorsContext} from '../Errors/index'

import AppStyles from '../../assets/styles'
import Images from '../../assets/images'
import Styles from './styles'
import { IContact } from '../../types'

interface ICurrentContact {
  setViewContact: (toggle: boolean) => void
  contact: IContact
}

function CurrentContact(props: ICurrentContact) {
  let history = useHistory()

  return (
    <View style={AppStyles.viewOverlay}>
      <View style={[AppStyles.credView, AppStyles.backgroundWhite]}>
        <TouchableOpacity
          style={AppStyles.backbutton}
          hitSlop={{top: 20, bottom: 20, left: 20, right: 20}}
          onPress={() => props.setViewContact(false)}>
          <Image source={Images.arrowDown} style={AppStyles.arrow} />
        </TouchableOpacity>
        {props.contact ? (
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
                    props.contact.alias ? null : {top:10} 
                  ]}>
                  {props.contact.invitation.label}
                </Text>
                <Text style={[{fontSize: 14}, AppStyles.textWhite]}>
                  {props.contact.alias}
                </Text>
              </View>
            </View>
              {props.contact.createdAt ? 
              (
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
                    ]}>
                    <Text style={AppStyles.textBold}>Created: </Text>{new Date(props.contact.createdAt).toDateString()}
                    {props.contact.address}
                  </Text>
                </View>
                </View>
              )
              :
              null
              }
              {props.contact.state ? 
              (
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
                    ]}>
                    <Text style={AppStyles.textBold}>State: </Text>{props.contact.state}
                    {props.contact.address}
                  </Text>
                </View>
                </View>
              )
              :
              null
              }
          </>
        ) : null}
      </View>
    </View>
  )
}

export default CurrentContact
