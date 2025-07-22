import React from 'react'
import { StyleSheet, View } from 'react-native'

import { useTheme } from '../../contexts/theme'

const RecordHeader: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { ColorPalette } = useTheme()
  const styles = StyleSheet.create({
    container: {
      backgroundColor: ColorPalette.brand.primaryBackground,
    },
  })

  return <View style={styles.container}>{children}</View>
}

export default RecordHeader
