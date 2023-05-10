import React from 'react'
import { Text, View } from 'react-native'

import { useTheme } from '../../contexts/theme'

interface CardWatermarkProps {
  watermark: string
  height: number
  width: number
  style?: any
}

const CardWatermark: React.FC<CardWatermarkProps> = ({ watermark, style, height, width }) => {
  const { TextTheme } = useTheme()
  const fontSize = style?.fontSize ?? TextTheme.normal.fontSize
  const watermarkText = `${watermark} `.repeat(Math.ceil(width / (Math.cos(30) * ((fontSize / 2) * (watermark.length + 1)))))
  return (
    <View style={{ position: 'absolute', left: '-50%', top: '-100%', width: '200%', height: '200%' }}>
      {Array.from({ length: Math.ceil((height * 2) / (fontSize) + 1) }).map((_, i) => (
        <Text key={i} numberOfLines={1} style={style}>
          {watermarkText}
        </Text>
      ))}
    </View>
  )
}

export default CardWatermark
