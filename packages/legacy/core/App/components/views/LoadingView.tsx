import React from 'react'
import { StyleSheet, useWindowDimensions } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { useAnimatedComponents } from '../../contexts/animated-components'
import { useTheme } from '../../contexts/theme'

const LoadingView: React.FC = () => {
  const { height } = useWindowDimensions()
  const { LoadingTheme } = useTheme()
  const { LoadingIndicator } = useAnimatedComponents()
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
    <SafeAreaView style={[styles.container]}>
      <LoadingIndicator />
    </SafeAreaView>
  )
}

export default LoadingView
