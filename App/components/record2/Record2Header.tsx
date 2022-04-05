import React from 'react'
import { StyleSheet, View } from 'react-native'

import { ColorPallet } from '../../theme'

const styles = StyleSheet.create({
  container: {
    backgroundColor: ColorPallet.brand.primaryBackground,
  },
})

const Record2Header: React.FC = ({ children }) => {
  return <View style={styles.container}>{children}</View>
}

export default Record2Header
