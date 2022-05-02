import React, { useEffect, useRef } from 'react'
import { View, StyleSheet, Animated } from 'react-native'

import CredentialCard from '../../assets/img/credential-card.svg'
import WalletBack from '../../assets/img/wallet-back.svg'
import WalletFront from '../../assets/img/wallet-front.svg'

const CredentialPending: React.FC = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current
  const tranAnim = useRef(new Animated.Value(-90)).current
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
    const animationDelay = 300

    setTimeout(() => {
      Animated.loop(
        Animated.sequence([Animated.timing(fadeAnim, fadeTiming), Animated.timing(tranAnim, slideTiming)])
      ).start()
    }, animationDelay)
  }, [])

  return (
    <View style={[style.container]}>
      <WalletBack style={[style.back]} {...{ height: 110, width: 110 }} />
      <Animated.View style={[{ opacity: fadeAnim, transform: [{ translateY: tranAnim }] }]}>
        <CredentialCard style={[style.card]} {...{ height: 110, width: 110 }} />
      </Animated.View>
      <WalletFront style={[style.front]} {...{ height: 140, width: 140 }} />
    </View>
  )
}

export default CredentialPending
