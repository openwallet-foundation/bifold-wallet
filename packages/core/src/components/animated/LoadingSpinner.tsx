import React, { useEffect, useRef } from 'react'
import { Animated } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'

import { testIdWithKey } from '../../utils/testable'
import { TOKENS, useServices } from '../../container-api'

const timing: Animated.TimingAnimationConfig = {
  toValue: 1,
  duration: 2000,
  useNativeDriver: true,
}

export interface LoadingSpinnerProps {
  color: string
  size?: number
  testID?: string
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 25, color }) => {
  const rotationAnim = useRef(new Animated.Value(0))
  const rotation = rotationAnim.current.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  })
  const [CustomLoadingSpinner] = useServices([TOKENS.COMPONENT_LOADING_SPINNER])

  useEffect(() => {
    Animated.loop(Animated.timing(rotationAnim.current, timing)).start()
  }, [])

  if(CustomLoadingSpinner) return <CustomLoadingSpinner size={size} color={color} testID={testIdWithKey('Loading')} />
  else return (
    <Animated.View style={{ transform: [{ rotate: rotation }] }}>
      <Icon style={{ color }} size={size} name="refresh" testID={testIdWithKey('Loading')} />
    </Animated.View>
  )
}

export default LoadingSpinner
