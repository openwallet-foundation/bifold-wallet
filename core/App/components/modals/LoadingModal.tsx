import React from 'react'
import { Dimensions, Modal, SafeAreaView, StyleSheet } from 'react-native'

import { useTheme } from '../../contexts/theme'
import LoadingIndicator from '../animated/LoadingIndicator'

const { height } = Dimensions.get('window')

const LoadingModal = ({ isUsingBackgroundLogo }: { isUsingBackgroundLogo?: boolean }) => {
  const { LoadingTheme } = useTheme()
  const styles = StyleSheet.create({
    container: {
      minHeight: height,
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: LoadingTheme.backgroundColor,
    },
  })

  return (
    <Modal visible={true} transparent={true}>
      <SafeAreaView style={[styles.container]}>
        <LoadingIndicator isUsingBackgroundLogo={Boolean(isUsingBackgroundLogo)} />
      </SafeAreaView>
    </Modal>
  )
}

export default LoadingModal
