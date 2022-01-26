import React from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { Colors } from 'react-native/Libraries/NewAppScreen'

interface Props {
  onPress?: () => void
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  button: {
    padding: 20,
  },
})

const CloseButton: React.FC<Props> = ({ onPress }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={onPress}>
        <Icon name="close" size={24} color={Colors.white}></Icon>
      </TouchableOpacity>
    </View>
  )
}

const QRScannerClose: React.FC<Props> = ({ onPress }) => {
  return <CloseButton onPress={onPress}></CloseButton>
}

export default QRScannerClose
