import React from 'react'
import { View, Text, StyleSheet, Modal } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'

import NAButton from '../NAButton'

interface Props {
  icon: string
  message: string
  backgroundColor: string
  visible: boolean
}

const Message: React.FC<Props> = ({ icon, message, backgroundColor, visible }) => {
  return (
    <Modal visible={visible} animationType="fade">
      <View style={[styles.container, { backgroundColor }]}>
        <View style={{ alignItems: 'center' }}>
          <Icon name={icon} color={'white'} size={160} />
          <Text style={styles.message}>{message}</Text>
        </View>
        <NAButton title="Continue" />
      </View>
    </Modal>
  )
}

export default Message

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  message: {
    textAlign: 'center',
    color: 'white',
    fontSize: 25,
  },
})
