import React from 'react'
import { Animated, StyleSheet, TouchableOpacity, View } from 'react-native'
import { ScalingDot } from 'react-native-animated-pagination-dots'

import LargeArrow from '../../assets/img/large-arrow.svg'
import { Colors } from '../../globalStyles'

interface IPaginationProps {
  data: any
  scrollX: Animated.Value
  next: () => void
  previous: () => void
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 16,
  },
  dot: {
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: Colors.mainColor,
  },
  relativePosition: {
    position: 'relative',
    top: 0,
  },
})

export const Pagination: React.FC<IPaginationProps> = ({ data, scrollX, next, previous }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={previous}>
        <LargeArrow height={24} width={48} fill={Colors.mainColor} />
      </TouchableOpacity>
      <ScalingDot
        data={data}
        scrollX={scrollX}
        inActiveDotColor={Colors.transparent}
        inActiveDotOpacity={1}
        activeDotColor={Colors.mainColor}
        activeDotScale={1}
        dotStyle={styles.dot}
        containerStyle={styles.relativePosition}
      />
      <TouchableOpacity onPress={next}>
        <LargeArrow height={24} width={48} fill={Colors.mainColor} style={{ transform: [{ rotate: '180deg' }] }} />
      </TouchableOpacity>
    </View>
  )
}
