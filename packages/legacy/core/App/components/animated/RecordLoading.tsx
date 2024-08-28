import React, { useEffect, useRef } from 'react'
import { View, StyleSheet, Animated } from 'react-native'

import { useTheme } from '../../contexts/theme'
import { testIdWithKey } from '../../utils/testable'

const fadeTiming: Animated.TimingAnimationConfig = {
  toValue: 0.2,
  duration: 1100,
  useNativeDriver: true,
}

const RecordLoading: React.FC = () => {
  const { ColorPallet } = useTheme()
  const rowFadeAnim = useRef(new Animated.Value(1))
  const style = StyleSheet.create({
    container: {
      flexDirection: 'column',
    },
    rectangle: {
      backgroundColor: ColorPallet.grayscale.veryLightGrey,
      height: 30,
      marginVertical: 10,
    },
    line: {
      backgroundColor: ColorPallet.grayscale.lightGrey,
      height: 1,
      marginVertical: 5,
    },
  })

  useEffect(() => {
    Animated.loop(Animated.timing(rowFadeAnim.current, fadeTiming)).start()
  }, [])

  const makeARow = () => {
    return (
      <View style={{ flexDirection: 'column' }}>
        <View style={[style.rectangle, { width: '35%' }]}></View>
        <View style={[style.rectangle, { width: '85%' }]}></View>
        <View style={style.line} />
      </View>
    )
  }

  return (
    <View style={style.container} testID={testIdWithKey('RecordLoading')}>
      <Animated.View style={{ opacity: rowFadeAnim.current }}>
        {makeARow()}
        {makeARow()}
      </Animated.View>
    </View>
  )
}

export default RecordLoading
