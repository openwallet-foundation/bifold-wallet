import { useNavigation } from '@react-navigation/core'
import { useFocusEffect } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import React, { Ref, useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Animated, BackHandler, Dimensions, FlatList, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import HeaderRight from '../components/buttons/HeaderRightSkip'
import { Pagination } from '../components/misc/Pagination'
import { DispatchAction } from '../contexts/reducers/store'
import { useStore } from '../contexts/store'
import { AuthenticateStackParams, Screens } from '../types/navigators'
import { testIdWithKey } from '../utils/testable'

const { width } = Dimensions.get('window')

export interface OnboardingStyleSheet {
  container: Record<string, any>
  carouselContainer: Record<string, any>
  pagerContainer: Record<string, any>
  pagerDot: Record<string, any>
  pagerDotActive: Record<string, any>
  pagerDotInactive: Record<string, any>
  pagerPosition: Record<string, any>
  pagerNavigationButton: Record<string, any>
}

interface OnboardingProps {
  pages: Array<Element>
  nextButtonText: string
  previousButtonText: string
  style: OnboardingStyleSheet
  disableSkip?: boolean
}

const Onboarding: React.FC<OnboardingProps> = ({
  pages,
  nextButtonText,
  previousButtonText,
  style,
  disableSkip = false,
}) => {
  const [activeIndex, setActiveIndex] = useState(0)
  const flatList: Ref<FlatList> = useRef(null)
  const scrollX = useRef(new Animated.Value(0)).current
  const { t } = useTranslation()
  const navigation = useNavigation<StackNavigationProp<AuthenticateStackParams>>()
  const [, dispatch] = useStore()

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

  const onSkipTouched = () => {
    dispatch({
      type: DispatchAction.DID_COMPLETE_TUTORIAL,
    })

    navigation.navigate(Screens.Terms)
  }

  useEffect(() => {
    !disableSkip &&
      navigation.setOptions({
        headerRight: () => (
          <HeaderRight
            title={t('Global.Skip')}
            accessibilityLabel={t('Global.Skip')}
            testID={testIdWithKey('Skip')}
            onPress={onSkipTouched}
          />
        ),
      })

    if (!disableSkip && activeIndex + 1 === pages.length) {
      navigation.setOptions({
        headerRight: () => false,
      })
    }
  }, [activeIndex])

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
    <SafeAreaView style={style.container} edges={['left', 'right', 'bottom']}>
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
