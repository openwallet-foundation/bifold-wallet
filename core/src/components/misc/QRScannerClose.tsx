import React from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, TouchableOpacity, View } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'

import { useTheme } from '../../contexts/theme'
import { testIdWithKey } from '../../utils/testable'

interface Props {
  onPress?: () => void
}

const CloseButton: React.FC<Props> = ({ onPress }) => {
  const { t } = useTranslation()
  const { ColorPallet } = useTheme()
  const styles = StyleSheet.create({
    container: {
      width: '100%',
      flexDirection: 'row',
      justifyContent: 'flex-end',
    },
    button: {
      padding: 16,
    },
  })
  return (
    <View style={styles.container}>
      <TouchableOpacity
        accessible={true}
        accessibilityLabel={t('Scan.Close')}
        testID={testIdWithKey('ScanClose')}
        style={styles.button}
        onPress={onPress}
      >
        <Icon name="close" size={24} color={ColorPallet.grayscale.white}></Icon>
      </TouchableOpacity>
    </View>
  )
}

const QRScannerClose: React.FC<Props> = ({ onPress }) => {
  return <CloseButton onPress={onPress}></CloseButton>
}

export default QRScannerClose
