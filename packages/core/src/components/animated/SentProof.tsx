import React, { useEffect, useRef } from 'react'
import { View, StyleSheet, Animated } from 'react-native'

import { useTheme } from '../../contexts/theme'

const ringFadeTiming: Animated.TimingAnimationConfig = {
  toValue: 0,
  duration: 600,
  useNativeDriver: true,
}
const checkFadeTiming: Animated.TimingAnimationConfig = {
  toValue: 1,
  duration: 600,
  useNativeDriver: true,
}

const SentProof: React.FC = () => {
  const { ColorPalette, Assets } = useTheme()
  const ringFadeAnim = useRef(new Animated.Value(1))
  const checkFadeAnim = useRef(new Animated.Value(0))
  const style = StyleSheet.create({
    container: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    credential: {
      marginTop: 25,
    },
    ring: {
      flexGrow: 3,
      position: 'absolute',
    },
    check: {
      position: 'absolute',
    },
  })
  const credentialInHandDisplayOptions = {
    fill: ColorPalette.notification.infoText,
    height: 130,
    width: 130,
  }
  const animatedCircleDisplayOptions = {
    fill: ColorPalette.notification.infoText,
    height: 250,
    width: 250,
  }

  useEffect(() => {
    Animated.parallel([
      Animated.timing(ringFadeAnim.current, ringFadeTiming),
      Animated.timing(checkFadeAnim.current, checkFadeTiming),
    ]).start()
  }, [])

  return (
    <View style={style.container}>
      <View style={{ alignItems: 'center' }}>
        <Assets.svg.credentialInHand style={style.credential} {...credentialInHandDisplayOptions} />
        <Animated.View style={[{ opacity: checkFadeAnim.current }, style.check]}>
          <Assets.svg.checkInCircle {...{ height: 45, width: 45 }} />
        </Animated.View>
      </View>
      <View style={style.ring}>
        <Animated.View style={{ opacity: ringFadeAnim.current }}>
          <Assets.svg.activityIndicator {...animatedCircleDisplayOptions} />
        </Animated.View>
      </View>
    </View>
  )
}

export default SentProof
