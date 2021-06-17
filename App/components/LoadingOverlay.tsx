import React, { useRef } from 'react'
import { Animated, View, StyleSheet, Dimensions } from 'react-native'

import AppHeader from './AppHeader'

import AppStyles from '../../assets/styles'

let ScreenHeight = Dimensions.get('window').height

function LoadingOverlay() {
  const loadAnim1 = useRef(new Animated.Value(1)).current
  const loadAnim2 = useRef(new Animated.Value(1)).current
  const loadAnim3 = useRef(new Animated.Value(1)).current

  const loadingAnimation = (x) => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(x, {
          toValue: 1.3,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(x, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
      {
        iterations: 500, // Number of repetitions
      }
    ).start()
  }

  loadingAnimation(loadAnim1)
  setTimeout(function () {
    loadingAnimation(loadAnim2)
  }, 500)
  setTimeout(function () {
    loadingAnimation(loadAnim3)
  }, 1000)

  /*const notifications = useContext(NotificationsContext)
	notifications.setVisible(true);
	notifications.setText("Notification!");*/
  return (
    <View style={Styles.loadingOverlay}>
      <View style={{ height: '10%' }} />
      <AppHeader />
      <View style={Styles.loadingBox}>
        <Animated.View
          style={[Styles.loadingRectangle, AppStyles.backgroundPrimary, { transform: [{ scaleY: loadAnim1 }] }]}
        ></Animated.View>
        <Animated.View
          style={[Styles.loadingRectangle, AppStyles.backgroundPrimary, { transform: [{ scaleY: loadAnim2 }] }]}
        ></Animated.View>
        <Animated.View
          style={[Styles.loadingRectangle, AppStyles.backgroundPrimary, { transform: [{ scaleY: loadAnim3 }] }]}
        ></Animated.View>
      </View>
    </View>
  )
}

export default LoadingOverlay

const Styles = StyleSheet.create({
  loadingRectangle: {
    marginHorizontal: 7,
    height: 40,
    width: 10,
  },
  loadingBox: {
    display: 'flex',
    flexDirection: 'row',
    height: '20%',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: '15%',
  },
  loadingOverlay: {
    height: ScreenHeight,
    width: '100%',
    paddingTop: '48%',
    position: 'absolute',
    alignSelf: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    elevation: 99,
  },
})
