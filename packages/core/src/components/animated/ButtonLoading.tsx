import React, { useEffect, useRef } from 'react'
import { Animated } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'

import { useTheme } from '../../contexts/theme'

const timing: Animated.TimingAnimationConfig = {
  toValue: 1,
  duration: 2000,
  useNativeDriver: true,
}

export interface ButtonLoadingProps {
  size?: number
}

const ButtonLoading: React.FC<ButtonLoadingProps> = ({ size = 25 }) => {
  const { ColorPalette } = useTheme()
  const rotationAnim = useRef(new Animated.Value(0))
  const rotation = rotationAnim.current.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  })

  useEffect(() => {
    Animated.loop(Animated.timing(rotationAnim.current, timing)).start()
  }, [])

  return (
    <Animated.View style={{ transform: [{ rotate: rotation }] }}>
      <Icon style={{ color: ColorPalette.brand.icon }} size={size} name="refresh" />
    </Animated.View>
  )
}

export default ButtonLoading
