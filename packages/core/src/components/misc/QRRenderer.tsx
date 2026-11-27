import React, { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Platform, StyleSheet, View, ViewStyle, useWindowDimensions } from 'react-native'
import QRCode from 'react-native-qrcode-svg'

import { useTheme } from '../../contexts/theme'
import { useInvertColorsEnabled } from '../../hooks/useInvertColorsEnabled'
import { testIdWithKey } from '../../utils/testable'
import { ThemedText } from '../texts/ThemedText'

interface QRRendererProps {
  value: string
  size?: number
  style?: ViewStyle
  onError?: () => void
}

const QRRenderer: React.FC<QRRendererProps> = ({ value, onError, size }) => {
  const { width } = useWindowDimensions()
  const { t } = useTranslation()
  const { ColorPalette } = useTheme()
  const isInvertColorsEnabled = useInvertColorsEnabled()

  // Scanners need dark modules on a light background. Android colour inversion applies to the whole
  // display and lets no view opt out, so while it is on the code is drawn inverted and the display
  // turns it back. iOS needs no redraw: the container opts out of Smart Invert below. iOS Classic
  // Invert inverts everything on screen, with no opt-out an app can use.
  const drawInverted = Platform.OS === 'android' && isInvertColorsEnabled
  const moduleColor = drawInverted ? 'white' : 'black'
  const backgroundColor = drawInverted ? 'black' : 'white'

  const styles = StyleSheet.create({
    container: {
      flexGrow: 1,
      marginVertical: 20,
      backgroundColor,
    },
    errorMessage: {
      color: ColorPalette.semantic.error,
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

  const qrSize = size ?? width - 80

  return (
    // The renderer flattens a view that only carries accessibilityIgnoresInvertColors out of the
    // native tree, taking the flag with it; collapsable={false} keeps the container a native view
    // whatever its style.
    <View
      style={styles.container}
      accessibilityIgnoresInvertColors
      collapsable={false}
      testID={testIdWithKey('QRRenderer')}
    >
      <QRCode
        ecl="L"
        value={value}
        size={qrSize}
        color={moduleColor}
        backgroundColor={backgroundColor}
        onError={handleQRCodeGenerationError}
      />
      {isInvalidQR && <ThemedText style={styles.errorMessage}>{t('QRRender.GenerationError')}</ThemedText>}
    </View>
  )
}

export default QRRenderer
