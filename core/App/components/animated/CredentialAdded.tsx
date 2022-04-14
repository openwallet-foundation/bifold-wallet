import React, { useEffect, useRef } from 'react'
import { View, StyleSheet, Animated } from 'react-native'

import CheckInCircle from '../../assets/img/check-in-circle.svg'
import CredentialCard from '../../assets/img/credential-card.svg'
import WalletBack from '../../assets/img/wallet-back.svg'
import WalletFront from '../../assets/img/wallet-front.svg'

const ConnectionLoading: React.FC = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current
  const tranAnim = useRef(new Animated.Value(-140)).current
  const slideTiming: Animated.TimingAnimationConfig = {
    toValue: -15,
    duration: 2000,
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
    wallet: {
      backgroundColor: 'transparent',
      position: 'absolute',
    },
    card: {
      backgroundColor: 'transparent',
    },
    check: {
      alignItems: 'center',
    },
  })
  const imageDisplayOptions = {
    height: 140,
    width: 140,
  }

  useEffect(() => {
    const animationDelay = 300

    setTimeout(() => {
      Animated.sequence([Animated.timing(tranAnim, slideTiming), Animated.timing(fadeAnim, fadeTiming)]).start()
    }, animationDelay)
  }, [])

  return (
    <View style={[style.container]}>
      <Animated.View style={[{ opacity: fadeAnim }, style.check]}>
        <CheckInCircle />
      </Animated.View>
      <View>
        <WalletBack style={[style.wallet]} {...imageDisplayOptions} />
        <Animated.View style={[{ transform: [{ translateY: tranAnim }] }]}>
          <CredentialCard style={[style.card]} {...imageDisplayOptions} />
        </Animated.View>
        <WalletFront style={[style.wallet]} {...imageDisplayOptions} />
      </View>
    </View>
  )
}

export default ConnectionLoading
