import { useFocusEffect } from '@react-navigation/native'
import React, { Ref, useCallback, useRef, useState } from 'react'
import { Animated, BackHandler, Dimensions, FlatList, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { Pagination } from '../components/shared/Pagination'

const { width } = Dimensions.get('window')

export interface OnboardingStyleSheet {
  container: Record<string, any>
  carouselContainer: Record<string, any>
  pagerContainer: Record<string, any>
  pagerDot: Record<string, any>
  pagerPosition: Record<string, any>
  pagerNavigationButton: Record<string, any>
}

interface OnboardingProps {
  pages: Array<Element>
  nextButtonText: string
  previousButtonText: string
  style: OnboardingStyleSheet
}

const Onboarding: React.FC<OnboardingProps> = ({ pages, nextButtonText, previousButtonText, style }) => {
  const [activeIndex, setActiveIndex] = useState(0)
  const flatList: Ref<FlatList> = useRef(null)
  const scrollX = useRef(new Animated.Value(0)).current

  const onViewableItemsChangedRef = useRef(({ viewableItems }: any) => {
    if (!viewableItems[0]) {
      return
    }

    setActiveIndex(viewableItems[0].index)
  })

  const viewabilityConfigRef = useRef({
    viewAreaCoveragePercentThreshold: 60,
  })

  const onScroll = Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
    useNativeDriver: false,
  })

  const next = () => {
    if (activeIndex + 1 < pages.length) {
      flatList?.current?.scrollToIndex({
        index: activeIndex + 1,
        animated: true,
      })
    }
  }

  const previous = () => {
    if (activeIndex !== 0) {
      flatList?.current?.scrollToIndex({
        index: activeIndex - 1,
        animated: true,
      })
    }
  }

  const renderItem = useCallback(
    ({ item, index }: { item: Element; index: number }) => (
      <View key={index} style={[{ width }, style.carouselContainer]}>
        {item}
      </View>
    ),
    []
  )

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        BackHandler.exitApp()
        return true
      }
      BackHandler.addEventListener('hardwareBackPress', onBackPress)
      return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress)
    }, [])
  )

  return (
    <SafeAreaView style={style.container}>
      <FlatList
        ref={flatList}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        style={[{ width }]}
        data={pages}
        renderItem={renderItem}
        viewabilityConfig={viewabilityConfigRef.current}
        onViewableItemsChanged={onViewableItemsChangedRef.current}
        onScroll={onScroll}
        scrollEventThrottle={16}
      />
      <Pagination
        pages={pages}
        activeIndex={activeIndex}
        nextButtonText={nextButtonText}
        previousButtonText={previousButtonText}
        scrollX={scrollX}
        style={style}
        next={next}
        previous={previous}
      />
    </SafeAreaView>
  )
}

export default Onboarding
