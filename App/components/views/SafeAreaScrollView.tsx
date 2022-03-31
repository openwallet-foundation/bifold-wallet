import React from 'react'
import { ScrollView, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { useThemeContext } from '../../utils/themeContext'

interface Props {
  children: React.ReactNode
}

const SafeAreaScrollView: React.FC<Props> = ({ children }) => {
  const { ColorPallet } = useThemeContext()
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: ColorPallet.brand.primaryBackground,
    },
    scrollView: {
      alignItems: 'center',
    },
  })
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollView}>{children}</ScrollView>
    </SafeAreaView>
  )
}

export default SafeAreaScrollView
