import React from 'react'
import { useTranslation } from 'react-i18next'
import { TouchableOpacity, StyleSheet } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'

import { useTheme } from '../../contexts/theme'
import { ITheme } from '../../theme'
import { testIdWithKey } from '../../utils/testable'

interface Props {
  active: boolean
  onPress?: () => void
}

function createStyles({ ColorPallet }: ITheme) {
  return StyleSheet.create({
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
}
const TorchButton: React.FC<Props> = ({ active, onPress, children }) => {
  const { t } = useTranslation()
  const theme = useTheme()
  const styles = createStyles(theme)
  return (
    <TouchableOpacity
      accessible={true}
      accessibilityLabel={t('Scan.Torch')}
      testID={testIdWithKey('ScanTorch')}
      style={[styles.container, { backgroundColor: active ? theme.ColorPallet.grayscale.white : undefined }]}
      onPress={onPress}
    >
      {children}
    </TouchableOpacity>
  )
}

const TorchIcon: React.FC<Props> = ({ active }) => {
  const theme = useTheme()
  const styles = createStyles(theme)
  return (
    <Icon
      name={active ? 'flash-on' : 'flash-off'}
      color={active ? theme.ColorPallet.grayscale.black : theme.ColorPallet.grayscale.white}
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
