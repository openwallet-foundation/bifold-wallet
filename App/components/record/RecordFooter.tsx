import React from 'react'
import { StyleSheet, View } from 'react-native'

import { ColorPallet } from '../../theme'

const styles = StyleSheet.create({
  container: {
    backgroundColor: ColorPallet.brand.secondaryBackground,
    height: '100%',
    paddingHorizontal: 25,
    paddingVertical: 16,
  },
})

const RecordFooter: React.FC = ({ children }) => {
  return <View style={styles.container}>{children}</View>
}

export default RecordFooter
