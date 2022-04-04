import React from 'react'
import { StyleSheet, View } from 'react-native'

import { useThemeContext } from '../../utils/themeContext'

const RecordFooter: React.FC = ({ children }) => {
  const { ColorPallet } = useThemeContext()
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
