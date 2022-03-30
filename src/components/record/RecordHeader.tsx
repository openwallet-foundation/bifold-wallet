import React from 'react'
import { StyleSheet, View } from 'react-native'

import { useThemeContext } from '../../utils/themeContext'

const RecordHeader: React.FC = ({ children }) => {
  const { ColorPallet } = useThemeContext()
  const styles = StyleSheet.create({
    container: {
      backgroundColor: ColorPallet.brand.primaryBackground,
    },
  })

  return <View style={styles.container}>{children}</View>
}

export default RecordHeader
