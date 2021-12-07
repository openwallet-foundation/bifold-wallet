import React from 'react'
import { Image, SafeAreaView, StyleSheet } from 'react-native'

import Images from '../../assets/images'
import { backgroundColor } from '../globalStyles'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: backgroundColor,
  },
})

/*
  To customize this splash screen set the background color of the
  iOS and Android launch screen to match the background color of
  of this view.
*/

const Splash: React.FC = () => {
  return (
    <SafeAreaView style={styles.container}>
      <Image source={Images.logoLarge} />
    </SafeAreaView>
  )
}

export default Splash
