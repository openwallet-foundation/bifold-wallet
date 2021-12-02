import React from 'react'
import { Image, View, StyleSheet } from 'react-native'

import Images from '../../../assets/images'

const styles = StyleSheet.create({
  headerLarge: {
    alignItems: 'center',
    marginVertical: 20,
  },
})

const AppHeaderLarge: React.FC<Props> = () => {
  return (
    <View style={styles.headerLarge}>
      <Image source={Images.logoLarge} style={{height: 130, width: 130}}/>
    </View>
  )
}

export default AppHeaderLarge
