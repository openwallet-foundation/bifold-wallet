import React from 'react'

import { Image, Text, TouchableOpacity, View } from 'react-native'

import { useHistory } from 'react-router-native'

import AppStyles from '../../assets/styles'
import Images from '../../assets/images'
import Styles from './styles'
import { IContact } from '../../types'

interface ICurrentContact {
  setViewContact: (toggle: boolean) => void
  contact: IContact
}

function CurrentContact(props: ICurrentContact) {
  const history = useHistory()

  return (
    <View style={AppStyles.viewOverlay}>
      <View style={[AppStyles.credView, AppStyles.backgroundWhite]}>
        <TouchableOpacity
          style={AppStyles.backbutton}
          hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
          onPress={() => props.setViewContact(false)}
        >
          <Image source={Images.arrowDown} style={AppStyles.arrow} />
        </TouchableOpacity>
        {props.contact ? (
          <>
            <View style={[AppStyles.tableItem, AppStyles.tableListItem, AppStyles.backgroundSecondary]}>
              <View>
                <Text style={[{ fontSize: 18, top: 10 }, AppStyles.textWhite]}>
                  {props.contact.alias ? props.contact.alias : props.contact.invitation.label}
                </Text>
              </View>
            </View>
            {props.contact.createdAt ? (
              <View style={[AppStyles.tableItem, Styles.tableItem, Styles.tableSubItem]}>
                <View>
                  <Text style={[{ fontSize: 18 }, AppStyles.textSecondary]}>
                    <Text style={AppStyles.textBold}>Created: </Text>
                    {new Date(props.contact.createdAt).toDateString()}
                  </Text>
                </View>
              </View>
            ) : null}
            {props.contact.state ? (
              <View style={[AppStyles.tableItem, Styles.tableItem, Styles.tableSubItem]}>
                <View>
                  <Text style={[{ fontSize: 18 }, AppStyles.textSecondary]}>
                    <Text style={AppStyles.textBold}>Connection State: </Text>
                    {props.contact.state}
                  </Text>
                </View>
              </View>
            ) : null}
          </>
        ) : null}
      </View>
    </View>
  )
}

export default CurrentContact
