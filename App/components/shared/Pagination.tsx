import React from 'react'
import { Animated, StyleSheet, TouchableOpacity, View } from 'react-native'
import { ScalingDot } from 'react-native-animated-pagination-dots'

import LargeArrow from '../../assets/img/large-arrow.svg'
import { Colors } from '../../globalStyles'

interface IPaginationStyleSheet {
  pagerContainer: Record<string, any>
  pagerDot: Record<string, any>
  pagerPosition: Record<string, any>
}

interface IPaginationProps {
  data: any
  scrollX: Animated.Value
  next: () => void
  previous: () => void
  style: IPaginationStyleSheet
}

const arrowHeight = 24
const arrowWidth = 48

export const Pagination: React.FC<IPaginationProps> = ({ data, scrollX, style, next, previous }) => {
  return (
    <View style={style.pagerContainer}>
      <TouchableOpacity testID={'previousButton'} accessible={true} accessibilityLabel={'Previous'} onPress={previous}>
        <LargeArrow height={arrowHeight} width={arrowWidth} fill={Colors.mainColor} />
      </TouchableOpacity>
      <ScalingDot
        data={data}
        scrollX={scrollX}
        inActiveDotColor={Colors.transparent}
        inActiveDotOpacity={1}
        activeDotColor={Colors.mainColor}
        activeDotScale={1}
        dotStyle={style.pagerDot}
        containerStyle={style.pagerPosition}
      />
      <TouchableOpacity testID={'nextButton'} accessible={true} accessibilityLabel={'Next'} onPress={next}>
        <LargeArrow
          height={arrowHeight}
          width={arrowWidth}
          fill={Colors.mainColor}
          style={{ transform: [{ rotate: '180deg' }] }}
        />
      </TouchableOpacity>
    </View>
  )
}
