import { useFocusEffect } from '@react-navigation/native'
import React, { Ref, useCallback, useRef, useState } from 'react'
import { Animated, BackHandler, Dimensions, FlatList, StyleSheet, Text, TouchableHighlight, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { SvgProps } from 'react-native-svg'

import { Pagination } from '../components/shared/Pagination'
import { Colors } from '../globalStyles'

const { width } = Dimensions.get('window')

interface IOnboardingStyleSheet {
  container: Record<string, any>
  controlsContainer: Record<string, any>
  headerText: Record<string, any>
  bodyText: Record<string, any>
  primaryButton: Record<string, any>
  primaryButtonText: Record<string, any>
}

interface IOnboardingCarouselData {
  image: React.FC<SvgProps>
  text: string
}

interface IOnboardingProps {
  title: string
  pages: Array<IOnboardingCarouselData>
  onOnboardingDismissed: () => Promise<void>
  style?: IOnboardingStyleSheet
}

const defaultStyle: IOnboardingStyleSheet = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  controlsContainer: {
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 32,
  },
  headerText: {
    fontWeight: 'bold',
    fontSize: 32,
    color: Colors.textColor,
  },
  bodyText: {
    fontWeight: 'normal',
    fontSize: 32,
    textAlign: 'center',
    margin: 16,
    color: Colors.textColor,
  },
  primaryButton: {
    padding: 16,
    borderRadius: 4,
    backgroundColor: Colors.mainColor,
  },
  primaryButtonText: {
    fontSize: 18,
    color: Colors.textColor,
  },
})

const Onboarding: React.FC<IOnboardingProps> = ({ title, pages, onOnboardingDismissed, style }) => {
  const [activeIndex, setActiveIndex] = useState(0)
  const flatList: Ref<FlatList> = useRef(null)
  const scrollX = useRef(new Animated.Value(0)).current
  const myStyle = style ? style : defaultStyle

  const onViewableItemsChangedRef = useRef(({ viewableItems }: any) => {
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
    ({ item, index }: { item: { image: React.FC<SvgProps>; text: string }; index: number }) => (
      <View key={index} style={[{ width }, { alignItems: 'center' }]}>
        {item.image({
          fill: Colors.textColor,
          height: 180,
          width: 180,
        })}
        <Text style={myStyle.bodyText}>{item.text}</Text>
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
    <SafeAreaView style={myStyle.container}>
      <Text style={myStyle.headerText}>{title}</Text>
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
      <Pagination data={pages} scrollX={scrollX} next={next} previous={previous} />
      <View style={myStyle.controlsContainer}>
        <TouchableHighlight
          style={myStyle.primaryButton}
          underlayColor={Colors.activeMain}
          onPress={onOnboardingDismissed}
        >
          <Text style={myStyle.primaryButtonText}>Get Started!</Text>
        </TouchableHighlight>
      </View>
    </SafeAreaView>
  )
}

export default Onboarding
