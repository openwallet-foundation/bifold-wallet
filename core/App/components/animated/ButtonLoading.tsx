import React, { useEffect, useRef } from 'react'
import { View, StyleSheet, Animated, Image } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'

import ActivityIndicator from '../../assets/img/activity-indicator-circle.svg'
import { useTheme } from '../../contexts/theme'
import { testIdWithKey } from '../../utils/testable'

const ButtonLoading: React.FC = () => {
  const { ColorPallet } = useTheme()
  const rotationAnim = useRef(new Animated.Value(0)).current
  const timing: Animated.TimingAnimationConfig = {
    toValue: 1,
    duration: 2000,
    useNativeDriver: true,
  }
  const rotation = rotationAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  })

  useEffect(() => {
    Animated.loop(Animated.timing(rotationAnim, timing)).start()
  }, [rotationAnim])

  return (
    <Animated.View style={[{ transform: [{ rotate: rotation }] }]}>
      <Icon style={{ color: ColorPallet.grayscale.white }} size={35} name="refresh" />
    </Animated.View>
  )
}

export default ButtonLoading
