import React, { useEffect, useRef } from 'react'
import { View, StyleSheet, Animated } from 'react-native'

import { useTheme } from '../../contexts/theme'

const slideTiming: Animated.TimingAnimationConfig = {
  toValue: -15,
  duration: 1200,
  useNativeDriver: true,
}
const fadeTiming: Animated.TimingAnimationConfig = {
  toValue: 1,
  duration: 600,
  useNativeDriver: true,
}
const animationDelay = 300

const CredentialAdded: React.FC = () => {
  const { Assets } = useTheme()
  const cardFadeAnim = useRef(new Animated.Value(0))
  const checkFadeAnim = useRef(new Animated.Value(0))
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
    check: {
      alignItems: 'center',
      marginBottom: 10,
    },
  })

  useEffect(() => {
    setTimeout(() => {
      Animated.sequence([
        Animated.timing(cardFadeAnim.current, fadeTiming),
        Animated.timing(tranAnim.current, slideTiming),
        Animated.timing(checkFadeAnim.current, fadeTiming),
      ]).start()
    }, animationDelay)
  }, [])

  return (
    <View style={style.container}>
      <Animated.View style={[{ opacity: checkFadeAnim.current }, style.check]}>
        <Assets.svg.checkInCircle {...{ height: 45, width: 45 }} />
      </Animated.View>
      <View>
        <Assets.svg.walletBack style={style.back} {...{ height: 110, width: 110 }} />
        <Animated.View style={{ opacity: cardFadeAnim.current, transform: [{ translateY: tranAnim.current }] }}>
          <Assets.svg.credentialCard style={style.card} {...{ height: 110, width: 110 }} />
        </Animated.View>
        <Assets.svg.walletFront style={style.front} {...{ height: 140, width: 140 }} />
      </View>
    </View>
  )
}

export default CredentialAdded
