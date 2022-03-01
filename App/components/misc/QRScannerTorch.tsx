import React from 'react'
import { TouchableOpacity, StyleSheet } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'

import { ColorPallet } from '../../theme'

interface Props {
  active: boolean
  onPress?: () => void
}

const styles = StyleSheet.create({
  container: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: ColorPallet.grayscale.white,
    borderRadius: 24,
    marginBottom: 50,
  },
  icon: {
    marginLeft: 2,
    marginTop: 2,
  },
})

const TorchButton: React.FC<Props> = ({ active, onPress, children }) => {
  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: active ? ColorPallet.grayscale.white : undefined }]}
      onPress={onPress}
    >
      {children}
    </TouchableOpacity>
  )
}

const TorchIcon: React.FC<Props> = ({ active }) => {
  return (
    <Icon
      name={active ? 'flash-on' : 'flash-off'}
      color={active ? ColorPallet.grayscale.black : ColorPallet.grayscale.white}
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
