import React, { useContext, useEffect, useRef } from 'react'
import { Animated } from 'react-native'
import { Rect } from 'react-native-svg'

import { TourContext } from '../../contexts/tour/tour-context'

interface SpotCutoutProps {
  useNativeDriver: boolean
}

const AnimatedRectangle = Animated.createAnimatedComponent(Rect)

export const SpotCutout = ({ useNativeDriver }: SpotCutoutProps) => {
  const { spot } = useContext(TourContext)

  const start = useRef(new Animated.ValueXY({ x: 0, y: 0 }))
  const width = useRef(new Animated.Value(0))
  const height = useRef(new Animated.Value(0))

  useEffect(() => {
    const { height: spotHeight, width: spotWidth, x, y } = spot
    const w = spotWidth + 20
    const h = spotHeight + 20
    const paddedX = x - 10
    const paddedY = y - 10

    const transition = (): Animated.CompositeAnimation => {
      return Animated.sequence([
        Animated.parallel([
          Animated.timing(start.current, {
            duration: 10,
            toValue: { x: paddedX, y: paddedY },
            useNativeDriver,
          }),
          Animated.timing(width.current, {
            duration: 10,
            toValue: w,
            useNativeDriver,
          }),
          Animated.timing(height.current, {
            duration: 10,
            toValue: h,
            useNativeDriver,
          }),
        ]),
      ])
    }

    transition().start()
  }, [spot, useNativeDriver])

  if ([spot.height, spot.width].every((value) => value <= 0)) {
    return null
  }

  return (
    <AnimatedRectangle
      width={width.current}
      height={height.current}
      x={start.current.x}
      y={start.current.y}
      opacity={1}
      rx={10}
      fill="black"
    />
  )
}
