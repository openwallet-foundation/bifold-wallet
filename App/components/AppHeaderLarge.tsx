import React from 'react'

import { Image, TouchableOpacity, View, StyleSheet } from 'react-native'

import { useHistory } from 'react-router-native'

import Images from '../../assets/images'

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

const Styles = StyleSheet.create({
  headerLarge: {
    height: '40%',
    justifyContent: 'center',
    alignItems: 'center',
  },
})
