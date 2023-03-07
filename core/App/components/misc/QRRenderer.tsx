import React, { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, View, ViewStyle, Text } from 'react-native'
import QRCode from 'react-native-qrcode-svg'

import { useTheme } from '../../contexts/theme'

interface QRRendererProps {
  value: string
  style?: ViewStyle
  onError?: () => void
}

const qrCodeSize = 390

const QRRenderer: React.FC<QRRendererProps> = ({ value, onError }) => {
  const { t } = useTranslation()
  const { ColorPallet } = useTheme()

  const styles = StyleSheet.create({
    container: {
      backgroundColor: 'white',
      padding: 10,
      flex: 1,
    },
    errorMessageContainer: {
      justifyContent: 'center',
    },
    errorMessageText: {
      color: ColorPallet.semantic.error,
      textAlign: 'center',
    },
  })

  const [isInvalidQR, setIsInvalidQR] = useState(false)

  const handleQRCodeGenerationError = useCallback(() => {
    setIsInvalidQR(true)
    if (onError) {
      onError()
    }
  }, [onError])

  return (
    <View style={styles.container}>
      <QRCode value={value} size={qrCodeSize} onError={handleQRCodeGenerationError} />
      {isInvalidQR && <Text style={styles.errorMessageText}>{t('QRRender.GenerationError')}</Text>}
    </View>
  )
}

export default QRRenderer
