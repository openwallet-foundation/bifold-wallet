import React from 'react'

import { Image, TouchableOpacity, View } from 'react-native'

import { useHistory } from 'react-router-native'

import Images from '../../assets/images'
import Styles from './styles'

interface IAppHeaderLarge {
  disabled?: boolean
}

function AppHeaderLarge(props: IAppHeaderLarge) {
  const history = useHistory()

  return (
    <View style={Styles.headerLarge}>
      <TouchableOpacity
        onPress={() => {
          history.push('/home')
        }}
        disabled={props.disabled ? true : false}
      >
        <Image source={Images.logoLarge} />
      </TouchableOpacity>
    </View>
  )
}

export default AppHeaderLarge
