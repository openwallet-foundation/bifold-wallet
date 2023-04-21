import React, { useContext, useEffect, useRef } from 'react'
import { Animated, Easing } from 'react-native'
import { Rect } from 'react-native-svg'

import { TourContext } from '../../contexts/tour/tour-context'

const AnimatedRectangle = Animated.createAnimatedComponent(Rect)

export const SpotCutout = () => {
  const { spot } = useContext(TourContext)
  const spotPadding = 20

  const start = useRef(new Animated.ValueXY({ x: 0, y: 0 }))
  const width = useRef(new Animated.Value(0))
  const height = useRef(new Animated.Value(0))

  useEffect(() => {
    const { height: spotHeight, width: spotWidth, x, y } = spot
    const w = spotWidth + spotPadding
    const h = spotHeight + spotPadding
    const paddedX = x - spotPadding / 2
    const paddedY = y - spotPadding / 2

    const transition = (): Animated.CompositeAnimation => {
      return Animated.parallel([
        Animated.timing(start.current, {
          duration: 500,
          easing: Easing.out(Easing.exp),
          toValue: { x: paddedX, y: paddedY },
          useNativeDriver: false,
        }),
        Animated.timing(width.current, {
          duration: 500,
          easing: Easing.out(Easing.exp),
          toValue: w,
          useNativeDriver: false,
        }),
        Animated.timing(height.current, {
          duration: 500,
          easing: Easing.out(Easing.exp),
          toValue: h,
          useNativeDriver: false,
        }),
      ])
    }

    transition().start()
  }, [spot.height, spot.width, spot.x, spot.y])

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
