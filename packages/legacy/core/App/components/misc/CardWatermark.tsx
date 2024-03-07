import React from 'react'
import { StyleProp, Text, TextStyle, View, StyleSheet } from 'react-native'

import { useTheme } from '../../contexts/theme'

interface CardWatermarkProps {
  watermark: string
  height: number
  width: number
  style?: StyleProp<TextStyle>
}

export const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    // left: '-50%',
    // top: '-100%',
    width: '300%',
    height: '300%',
    // margin: -220,
    transform: [{ rotate: '-30deg' }],
  },
  watermarkText: {
    opacity: 0.16,
    // transform: [{ rotate: '-30deg' }],
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
        <Text
          accessible={false}
          key={i}
          numberOfLines={1}
          style={StyleSheet.compose({ ...styles.watermarkText, ...{ fontSize } }, style)}
        >
          {watermarkText}
        </Text>
      ))}
    </View>
  )
}

export default CardWatermark
