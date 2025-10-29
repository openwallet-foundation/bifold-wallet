import React, { useEffect, useRef } from 'react'
import { Animated } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'

const timing: Animated.TimingAnimationConfig = {
  toValue: 1,
  duration: 2000,
  useNativeDriver: true,
}

export interface LoadingSpinnerProps {
  size?: number
  color: string
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 25, color }) => {
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
      <Icon style={{ color }} size={size} name="refresh" />
    </Animated.View>
  )
}

export default LoadingSpinner
