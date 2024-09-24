import React, { useEffect, useRef } from 'react'
import { StyleProp, ViewStyle, View, StyleSheet, Animated } from 'react-native'

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

const RecordLoading: React.FC<RecordLoadingProps> = ({ style }) => {
  const { ColorPallet } = useTheme()
  const rowFadeAnim = useRef(new Animated.Value(1))
  const myStyle = StyleSheet.create({
    container: {
      flexDirection: 'column',
    },
    rectangle: {
      backgroundColor: ColorPallet.grayscale.lightGrey,
      height: 30,
      marginVertical: 5,
      borderRadius: 10,
    },
  })

  useEffect(() => {
    Animated.loop(Animated.timing(rowFadeAnim.current, fadeTiming)).start()
  }, [])

  return (
    <Animated.View
      style={[{ opacity: rowFadeAnim.current, backgroundColor: ColorPallet.grayscale.white, borderRadius: 15 }, style]}
    >
      <View style={myStyle.container} testID={testIdWithKey('RecordLoading')}>
        <View style={{ flexDirection: 'row' }}>
          <View
            style={{
              marginLeft: 0,
              backgroundColor: ColorPallet.grayscale.lightGrey,
              width: 40,
              borderTopLeftRadius: 15,
              borderBottomLeftRadius: 15,
            }}
          />
          <View
            style={{
              marginLeft: -22,
              marginTop: 20,
              backgroundColor: ColorPallet.grayscale.lightGrey,
              height: 45,
              width: 45,
              borderRadius: 5,
            }}
          />
          <View style={{ marginLeft: 15, marginTop: 15, marginBottom: 15 }}>
            <View style={[myStyle.rectangle, { width: 240, height: 20 }]} />
            <View style={[myStyle.rectangle, { width: 145, height: 25 }]} />
            <View style={[myStyle.rectangle, { width: 75, height: 20, marginTop: 20 }]} />
            <View style={[myStyle.rectangle, { width: 210, height: 25 }]} />
          </View>
        </View>
      </View>
    </Animated.View>
  )
}

export default RecordLoading
