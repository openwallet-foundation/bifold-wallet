import React, { useEffect, useRef } from 'react'
import { View, StyleSheet, Animated } from 'react-native'

import { useTheme } from '../../contexts/theme'


const slideTiming: Animated.TimingAnimationConfig = {
  toValue: -15,
  duration: 1400,
  useNativeDriver: true,
}
const fadeTiming: Animated.TimingAnimationConfig = {
  toValue: 1,
  duration: 400,
  useNativeDriver: true,
}
const animationDelay = 300

const CredentialPending: React.FC = () => {
  const { Assets } = useTheme()
  const fadeAnim = useRef(new Animated.Value(0))
  const tranAnim = useRef(new Animated.Value(-90))
  const style = StyleSheet.create({
    container: {
      flexDirection: 'column',
    },
    back: {
      backgroundColor: 'transparent',
      position: 'absolute',
      marginTop: -30,
    },
    front: {
      backgroundColor: 'transparent',
    },
    card: {
      backgroundColor: 'transparent',
      position: 'absolute',
      marginLeft: 10,
    },
  })

  useEffect(() => {
    setTimeout(() => {
      Animated.loop(
        Animated.sequence([Animated.timing(fadeAnim.current, fadeTiming), Animated.timing(tranAnim.current, slideTiming)])
      ).start()
    }, animationDelay)
  }, [])

  return (
    <View style={style.container}>
      <Assets.svg.walletBack style={style.back} {...{ height: 110, width: 110 }} />
      <Animated.View style={{ opacity: fadeAnim.current, transform: [{ translateY: tranAnim.current }] }}>
        <Assets.svg.credentialCard style={style.card} {...{ height: 110, width: 110 }} />
      </Animated.View>
      <Assets.svg.walletFront style={style.front} {...{ height: 140, width: 140 }} />
    </View>
  )
}

export default CredentialPending
