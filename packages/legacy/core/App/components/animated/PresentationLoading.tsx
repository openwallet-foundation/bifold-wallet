import React, { useEffect, useRef } from 'react'
import { View, StyleSheet, Animated } from 'react-native'

import { useTheme } from '../../contexts/theme'

const timing: Animated.TimingAnimationConfig = {
  toValue: 1,
  duration: 2000,
  useNativeDriver: true,
}

const PresentationLoading: React.FC = () => {
  const { ColorPallet, Assets } = useTheme()
  const rotationAnim = useRef(new Animated.Value(0))
  const rotation = rotationAnim.current.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  })
  const style = StyleSheet.create({
    container: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    animation: {
      position: 'absolute',
      zIndex: 1,
    },
  })
  const displayOptions = {
    fill: ColorPallet.notification.infoText,
  }
  const animatedCircleDisplayOptions = {
    fill: ColorPallet.notification.infoText,
    height: 250,
    width: 250,
  }

  useEffect(() => {
    Animated.loop(Animated.timing(rotationAnim.current, timing)).start()
  }, [])

  return (
    <View style={style.container}>
      <Assets.svg.chatLoading style={style.animation} {...displayOptions} />
      <Animated.View style={{ transform: [{ rotate: rotation }] }}>
        <Assets.svg.activityIndicator {...animatedCircleDisplayOptions} />
      </Animated.View>
    </View>
  )
}

export default PresentationLoading
