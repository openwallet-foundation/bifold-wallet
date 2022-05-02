import React, { useEffect, useRef } from 'react'
import { View, StyleSheet, Animated } from 'react-native'

import CheckInCircle from '../../assets/img/check-in-circle.svg'
import CredentialCard from '../../assets/img/credential-card.svg'
import WalletBack from '../../assets/img/wallet-back.svg'
import WalletFront from '../../assets/img/wallet-front.svg'

const CredentialAdded: React.FC = () => {
  const cardFadeAnim = useRef(new Animated.Value(0)).current
  const checkFadeAnim = useRef(new Animated.Value(0)).current
  const tranAnim = useRef(new Animated.Value(-90)).current
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
    const animationDelay = 300

    setTimeout(() => {
      Animated.sequence([
        Animated.timing(cardFadeAnim, fadeTiming),
        Animated.timing(tranAnim, slideTiming),
        Animated.timing(checkFadeAnim, fadeTiming),
      ]).start()
    }, animationDelay)
  }, [])

  return (
    <View style={[style.container]}>
      <Animated.View style={[{ opacity: checkFadeAnim }, style.check]}>
        <CheckInCircle {...{ height: 45, width: 45 }} />
      </Animated.View>
      <View>
        <WalletBack style={[style.back]} {...{ height: 110, width: 110 }} />
        <Animated.View style={[{ opacity: cardFadeAnim, transform: [{ translateY: tranAnim }] }]}>
          <CredentialCard style={[style.card]} {...{ height: 110, width: 110 }} />
        </Animated.View>
        <WalletFront style={[style.front]} {...{ height: 140, width: 140 }} />
      </View>
    </View>
  )
}

export default CredentialAdded
