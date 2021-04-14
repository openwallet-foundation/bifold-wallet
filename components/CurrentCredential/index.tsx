import React from 'react'

import { Image, Text, TouchableOpacity, View } from 'react-native'

import { useHistory } from 'react-router-native'

import AppStyles from '../../assets/styles'
import Images from '../../assets/images'
import Styles from './styles'
import { ICredential } from '../../types'

interface ICurrentCredential {
  credential: ICredential
}

function CurrentCredential(props) {
  const history = useHistory()

  return (
    <View style={AppStyles.viewOverlay}>
      <View style={[AppStyles.credView, AppStyles.backgroundWhite]}>
        <TouchableOpacity
          style={AppStyles.backbutton}
          hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
          onPress={() => props.setViewCredential(false)}
        >
          <Image source={Images.arrowDown} style={AppStyles.arrow} />
        </TouchableOpacity>
        {props.credential ? (
          <>
            <View style={[AppStyles.tableItem, AppStyles.tableListItem, AppStyles.backgroundSecondary]}>
              <View>
                <Text style={[{ fontSize: 20, top: 8 }, AppStyles.textWhite, AppStyles.textBold]}>
                  Driver's License
                </Text>
              </View>
            </View>
            <View style={[AppStyles.tableItem, Styles.tableItem, Styles.tableSubItem]}>
              <View>
                <Text style={[{ fontSize: 18 }, AppStyles.textBlack]}>
                  <Text style={AppStyles.textBold}>Name: </Text>
                  {props.credential.attributes.first_name} {props.credential.attributes.last_name}
                </Text>
              </View>
            </View>
            <View style={[AppStyles.tableItem, Styles.tableItem, Styles.tableSubItem]}>
              <View>
                <Text style={[{ fontSize: 18 }, AppStyles.textSecondary]}>
                  <Text style={AppStyles.textBold}>Gender: </Text>
                  {props.credential.attributes.gender}
                </Text>
              </View>
            </View>
            <View style={[AppStyles.tableItem, Styles.tableItem, Styles.tableSubItem]}>
              <View>
                <Text style={[{ fontSize: 18 }, AppStyles.textSecondary]}>
                  <Text style={AppStyles.textBold}>Age: </Text>
                  {props.credential.attributes.age}
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
