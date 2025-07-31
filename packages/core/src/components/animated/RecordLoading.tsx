import React, { useEffect, useRef } from 'react'
import { StyleProp, ViewStyle, View, StyleSheet, Animated, useWindowDimensions } from 'react-native'

import { useTheme } from '../../contexts/theme'
import { testIdWithKey } from '../../utils/testable'

type RecordLoadingProps = {
  style?: StyleProp<ViewStyle>
}

const fadeTiming: Animated.TimingAnimationConfig = {
  toValue: 0.4,
  duration: 1100,
  useNativeDriver: true,
}

const borderRadius = 10

const RecordLoading: React.FC<RecordLoadingProps> = ({ style }) => {
  const { width } = useWindowDimensions()
  const padding = width * 0.05
  const logoHeight = width * 0.12
  const { ColorPalette } = useTheme()
  const rowFadeAnim = useRef(new Animated.Value(1))
  const myStyle = StyleSheet.create({
    container: {
      flexDirection: 'column',
    },
    rectangle: {
      backgroundColor: ColorPalette.grayscale.lightGrey,
      height: 30,
      marginVertical: 5,
      borderRadius,
    },
    margin: {
      backgroundColor: ColorPalette.grayscale.lightGrey,
      width: 40,
      borderTopLeftRadius: borderRadius,
      borderBottomLeftRadius: borderRadius,
    },
    logo: {
      marginLeft: -1 * logoHeight + padding,
      marginTop: padding,
      backgroundColor: ColorPalette.grayscale.lightGrey,
      height: logoHeight,
      width: logoHeight,
      borderRadius,
    },
  })

  useEffect(() => {
    Animated.loop(Animated.timing(rowFadeAnim.current, fadeTiming)).start()
  }, [])

  return (
    <Animated.View
      style={[{ opacity: rowFadeAnim.current, backgroundColor: ColorPalette.grayscale.white, borderRadius: 15 }, style]}
    >
      <View style={myStyle.container} testID={testIdWithKey('RecordLoading')}>
        <View style={{ flexDirection: 'row' }}>
          <View style={myStyle.margin} />
          <View style={myStyle.logo} />
          <View style={{ flexGrow: 1, marginLeft: 15, marginTop: 15, marginBottom: 15 }}>
            <View style={[myStyle.rectangle, { width: '100%', height: 20 }]} />
            <View style={[myStyle.rectangle, { width: '75%', height: 25 }]} />
            <View style={[myStyle.rectangle, { width: '35%', height: 20, marginTop: 20 }]} />
            <View style={[myStyle.rectangle, { width: '90%', height: 25 }]} />
          </View>
        </View>
      </View>
    </Animated.View>
  )
}

export default RecordLoading
