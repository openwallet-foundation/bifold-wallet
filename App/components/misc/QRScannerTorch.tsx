import React from 'react'
import { TouchableWithoutFeedback, StyleSheet } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'

interface Props {
  active: boolean
  onPress?: () => void
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: 48,
    height: 48,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'white',
  },
  icon: {
    marginLeft: 2,
    marginTop: 2,
  },
})

const TorchButton: React.FC<Props> = ({ active, onPress, children }) => {
  return (
    <TouchableWithoutFeedback
      style={[styles.container, { backgroundColor: active ? 'white' : undefined }]}
      onPress={onPress}
    >
      {children}
    </TouchableWithoutFeedback>
  )
}

const TorchIcon: React.FC<Props> = ({ active }) => {
  return (
    <Icon
      name={active ? 'flash-on' : 'flash-off'}
      color={active ? '#000000' : '#ffffff'}
      size={24}
      style={styles.icon}
    />
  )
}

const QRScannerTorch: React.FC<Props> = ({ active, onPress }) => {
  return (
    <TorchButton active={active} onPress={onPress}>
      <TorchIcon active={active} />
    </TorchButton>
  )
}

export default QRScannerTorch
