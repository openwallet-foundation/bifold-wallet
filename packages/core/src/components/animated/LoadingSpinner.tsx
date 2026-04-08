import React, { useEffect, useRef } from 'react'
import { Animated } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'

import { testIdWithKey } from '../../utils/testable'

const timing: Animated.TimingAnimationConfig = {
  toValue: 1,
  duration: 2000,
  useNativeDriver: true,
}

export interface LoadingSpinnerProps {
  color: string
  size?: number
  children?: React.ReactNode
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 25, color, children }) => {
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
      {children ?? <Icon style={{ color }} size={size} name="refresh" testID={testIdWithKey('Loading')} />}
    </Animated.View>
  )
}

export default LoadingSpinner
