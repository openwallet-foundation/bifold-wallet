import React from 'react'
import { View, StyleSheet } from 'react-native'
import Svg, { Defs, Rect, LinearGradient, Stop } from 'react-native-svg'

type GradientProps = {
  backgroundColor: string
  height?: number
}

/**
 * To be used in a relative position controlsContainer that is below (and not in) scrollview content
 */
const ContentGradient = ({ backgroundColor, height = 30 }: GradientProps) => {
  const id = 'gradient'

  const styles = StyleSheet.create({
    container: {
      position: 'absolute',
      height,
      width: '100%',
      top: -height,
    },
  })

  return (
    <View style={styles.container}>
      <Svg height={`${height}`} width="100%" style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id={id} x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor={backgroundColor} stopOpacity={0} />
            <Stop offset="100%" stopColor={backgroundColor} stopOpacity={1} />
          </LinearGradient>
        </Defs>
        <Rect height={`${height}`} width="100%" fill={`url(#${id})`} />
      </Svg>
    </View>
  )
}

export default ContentGradient
