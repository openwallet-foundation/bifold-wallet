import React, { useEffect, useRef } from 'react'
import { View, StyleSheet, Animated } from 'react-native'

import { useTheme } from '../../contexts/theme'

const SendingProof: React.FC = () => {
  const { ColorPallet, Assets } = useTheme()
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
    container: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    animation: {
      position: 'absolute',
    },
  })
  const credentialInHandDisplayOptions = {
    fill: ColorPallet.notification.infoText,
    height: 130,
    width: 130,
  }
  const animatedCircleDisplayOptions = {
    fill: ColorPallet.notification.infoText,
    height: 250,
    width: 250,
  }

  useEffect(() => {
    Animated.loop(Animated.timing(rotationAnim, timing)).start()
  }, [rotationAnim])

  return (
    <View style={style.container}>
      <Assets.svg.credentialInHand style={style.animation} {...credentialInHandDisplayOptions} />
      <Animated.View style={{ transform: [{ rotate: rotation }] }}>
        <Assets.svg.activityIndicator {...animatedCircleDisplayOptions} />
      </Animated.View>
    </View>
  )
}

export default SendingProof
