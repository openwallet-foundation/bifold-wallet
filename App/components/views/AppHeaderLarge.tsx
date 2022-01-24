import React from 'react'
import { Image, View, StyleSheet } from 'react-native'

import Images from '../../../assets/images'

const styles = StyleSheet.create({
  headerLarge: {
    alignItems: 'center',
    marginVertical: 20,
  },
})

const AppHeaderLarge: React.FC = () => {
  return (
    <View style={styles.headerLarge}>
      <Image source={Images.logoLarge} />
    </View>
  )
}

export default AppHeaderLarge
