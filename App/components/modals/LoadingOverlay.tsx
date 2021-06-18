import React from 'react'
import { View, Text, StyleSheet, Modal } from 'react-native'

import { AppHeader } from 'components'

interface Props {
  visible: boolean
}

const LoadingOverlay: React.FC<Props> = ({ visible }) => {
  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.container}>
        <AppHeader />
        <Text style={styles.text}>Loading...</Text>
      </View>
    </Modal>
  )
}

export default LoadingOverlay

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-evenly',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.85)',
  },
  text: {
    fontWeight: 'bold',
    fontSize: 25,
  },
})
