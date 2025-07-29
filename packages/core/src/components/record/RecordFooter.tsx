import React from 'react'
import { StyleSheet, View } from 'react-native'

import { useTheme } from '../../contexts/theme'

const RecordFooter: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { ColorPalette } = useTheme()
  const styles = StyleSheet.create({
    container: {
      backgroundColor: ColorPalette.brand.primaryBackground,
      height: '100%',
    },
  })
  return <View style={styles.container}>{children}</View>
}

export default RecordFooter
