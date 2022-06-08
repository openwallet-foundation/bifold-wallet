import React from 'react'
import { StyleSheet, View } from 'react-native'

import { useTheme } from '../../contexts/theme'

const RecordFooter: React.FC = ({ children }) => {
  const { ColorPallet } = useTheme()
  const styles = StyleSheet.create({
    container: {
      backgroundColor: ColorPallet.brand.secondaryBackground,
      height: '100%',
      paddingHorizontal: 25,
      paddingVertical: 16,
    },
  })
  return <View style={styles.container}>{children}</View>
}

export default RecordFooter
