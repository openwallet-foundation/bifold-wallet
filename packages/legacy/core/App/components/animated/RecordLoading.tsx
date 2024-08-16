import React, { useEffect, useRef } from 'react'
import { View, StyleSheet, Animated } from 'react-native'

import { useTheme } from '../../contexts/theme'
import { testIdWithKey } from '../../utils/testable'

const RecordLoading: React.FC = () => {
  const { ColorPallet } = useTheme()
  const rowFadeAnim = useRef(new Animated.Value(1)).current
  const fadeTiming: Animated.TimingAnimationConfig = {
    toValue: 0.4,
    duration: 1100,
    useNativeDriver: true,
  }
  const style = StyleSheet.create({
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
    Animated.loop(Animated.timing(rowFadeAnim, fadeTiming)).start()
  }, [rowFadeAnim, fadeTiming])

  // const skeletonLayout = () => {
  //   return (
  //     <View style={{ flexDirection: 'row' }}>
  //       <View
  //         style={{
  //           marginLeft: 0,
  //           backgroundColor: ColorPallet.grayscale.lightGrey,
  //           width: 60,
  //           borderTopLeftRadius: 15,
  //           borderBottomLeftRadius: 15,
  //         }}
  //       />
  //       <View
  //         style={{
  //           marginLeft: -22,
  //           marginTop: 20,
  //           backgroundColor: ColorPallet.grayscale.veryLightGrey,
  //           height: 45,
  //           width: 45,
  //           borderRadius: 5,
  //         }}
  //       />
  //       <View style={{ marginLeft: 15, marginTop: 15, marginBottom: 15 }}>
  //         <View style={[style.rectangle, { width: 240, height: 20 }]} />
  //         <View style={[style.rectangle, { width: 145, height: 25 }]} />
  //         <View style={[style.rectangle, { width: 75, height: 20, marginTop: 20 }]} />
  //         <View style={[style.rectangle, { width: 210, height: 25 }]} />
  //       </View>
  //     </View>
  //   )
  // }
  // ColorPallet.brand.secondaryBackground

  return (
    <Animated.View style={[{ opacity: rowFadeAnim, backgroundColor: ColorPallet.grayscale.white, borderRadius: 15 }]}>
      <View style={[style.container]} testID={testIdWithKey('RecordLoading')}>
        <View style={{ flexDirection: 'row' }}>
          <View
            style={{
              marginLeft: 0,
              backgroundColor: ColorPallet.grayscale.lightGrey,
              width: 60,
              borderTopLeftRadius: 15,
              borderBottomLeftRadius: 15,
              // overflow: 'hidden',
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
            <View style={[style.rectangle, { width: 240, height: 20 }]} />
            <View style={[style.rectangle, { width: 145, height: 25 }]} />
            <View style={[style.rectangle, { width: 75, height: 20, marginTop: 20 }]} />
            <View style={[style.rectangle, { width: 210, height: 25 }]} />
          </View>
        </View>
      </View>
    </Animated.View>
  )
}

export default RecordLoading
