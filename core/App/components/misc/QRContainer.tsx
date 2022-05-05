import React, { FC } from 'react'
import { StyleSheet, Text, View, ViewStyle } from 'react-native'
import QRCode from 'react-native-qrcode-svg'

import { useTheme } from '../../contexts/theme'

interface QRContainerProps {
  value?: string
  size: number
  color?: string
  containerStyle?: ViewStyle
}

const QRContainer: FC<QRContainerProps> = ({ value, size, color, containerStyle }) => {
  const { ColorPallet, borderRadius, TextTheme } = useTheme()
  const styles = StyleSheet.create({
    container: {
      padding: 15,
      backgroundColor: ColorPallet.grayscale.white,
      borderRadius,
    },
    emptyContainer: {
      backgroundColor: ColorPallet.grayscale.white,
      borderRadius,
      height: size + 25,
      width: size + 25,
      alignItems: 'center',
      justifyContent: 'center',
    },
    emptyText: {
      textAlign: 'center',
      ...TextTheme.headingFour,
      color: ColorPallet.grayscale.black,
    },
  })
  return (
    <>
      {value == 'placeholder' ? (
        <View
          style={[styles.emptyContainer, containerStyle]}
          testID="empty-QRContainer"
          children={<Text style={styles.emptyText}>Loading...</Text>}
        />
      ) : (
        <View
          style={[styles.container, containerStyle]}
          testID="QRContainer"
          children={<QRCode value={value} size={size} color={color} />}
        />
      )}
    </>
  )
}

export default QRContainer
