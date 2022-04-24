import React, { useEffect, useRef } from 'react'
import { View, StyleSheet, Animated } from 'react-native'

import ActivityIndicator from '../../assets/img/activity-indicator-circle.svg'
import Wallet from '../../assets/img/wallet.svg'
import { useTheme } from '../../contexts/theme'

const ConnectionLoading: React.FC = () => {
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
  const style = StyleSheet.create({
    animation: {
      position: 'absolute',
    },
  })
  const imageDisplayOptions = {
    fill: ColorPallet.notification.infoText,
    height: 250,
    width: 250,
  }

  useEffect(() => {
    Animated.loop(Animated.timing(rotationAnim, timing)).start()
  }, [rotationAnim])

  return (
    <View>
      <Wallet {...imageDisplayOptions} />
      <Animated.View style={[style.animation, { transform: [{ rotate: rotation }] }]}>
        <ActivityIndicator {...imageDisplayOptions} />
      </Animated.View>
    </View>
  )
}

export default ConnectionLoading
