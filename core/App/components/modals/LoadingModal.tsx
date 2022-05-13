import React from 'react'
import { ActivityIndicator, Dimensions, Image, Modal, SafeAreaView, StyleSheet } from 'react-native'

import { useTheme } from '../../contexts/theme'

const { height } = Dimensions.get('window')

const LoadingModal: React.FC = () => {
  const { ColorPallet, Assets } = useTheme()
  const styles = StyleSheet.create({
    container: {
      minHeight: height,
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: ColorPallet.brand.primary,
    },
  })

  return (
    <Modal visible={true} transparent={true}>
      <SafeAreaView style={[styles.container]}>
        <Image source={Assets.img.logoLarge} />
        <ActivityIndicator color={ColorPallet.grayscale.white} />
      </SafeAreaView>
    </Modal>
  )
}

export default LoadingModal
