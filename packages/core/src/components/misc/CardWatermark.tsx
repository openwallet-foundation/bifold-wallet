import React from 'react'
import { StyleProp, TextStyle, View, StyleSheet } from 'react-native'

import { useTheme } from '../../contexts/theme'
import { ThemedText } from '../texts/ThemedText'

interface CardWatermarkProps {
  watermark: string
  height: number
  width: number
  style?: StyleProp<TextStyle>
}

export const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: '200%',
    height: '200%',
    marginTop: -220,
  },
  watermarkText: {
    opacity: 0.16,
    marginLeft: -80,
    transform: [{ rotate: '-30deg' }],
    overflow: 'hidden',
  },
})

const CardWatermark: React.FC<CardWatermarkProps> = ({ watermark, style, height, width }) => {
  const { TextTheme } = useTheme()
  const fontSize = Number((style as React.CSSProperties)?.fontSize ?? TextTheme.headingFour.fontSize)
  const watermarkText = `${watermark} `.repeat(
    Math.ceil(width / (Math.cos(30) * ((fontSize / 2) * (watermark.length + 1))))
  )

  return (
    <View style={styles.container}>
      {Array.from({ length: Math.ceil((height * 2) / fontSize + 1) }).map((_, i) => (
        <ThemedText
          accessible={false}
          key={i}
          numberOfLines={1}
          style={StyleSheet.compose({ ...styles.watermarkText, ...{ fontSize } }, style)}
        >
          {watermarkText}
        </ThemedText>
      ))}
    </View>
  )
}

export default CardWatermark
