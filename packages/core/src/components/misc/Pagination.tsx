import React from 'react'
import { useTranslation } from 'react-i18next'
import { Animated, TouchableOpacity, View } from 'react-native'
import { ScalingDot } from 'react-native-animated-pagination-dots'

import { hitSlop } from '../../constants'
import { testIdWithKey } from '../../utils/testable'
import { ThemedText } from '../texts/ThemedText'

interface IPaginationStyleSheet {
  pagerContainer: Record<string, any>
  pagerDot: Record<string, any>
  pagerDotActive: Record<string, any>
  pagerDotInactive: Record<string, any>
  pagerPosition: Record<string, any>
  pagerNavigationButton: Record<string, any>
}

interface IPaginationProps {
  pages: Array<Element>
  activeIndex: number
  scrollX: Animated.Value
  next: () => void
  nextButtonText?: string
  previous: () => void
  previousButtonText?: string
  style: IPaginationStyleSheet
}

export const Pagination: React.FC<IPaginationProps> = ({
  pages,
  activeIndex,
  scrollX,
  style,
  next,
  nextButtonText,
  previous,
  previousButtonText,
}) => {
  const { t } = useTranslation()

  const shouldHideBack = (): boolean => {
    if (activeIndex === 0) {
      return true
    }

    return false
  }

  const shouldHideNext = (): boolean => {
    if (activeIndex === pages.length - 1) {
      return true
    }

    return false
  }

  // FIXME: Issue #204. Better to `disable` the `TouchableOpacity`
  // controls rather than changing the color to transparent.

  return (
    <View style={style.pagerContainer}>
      <TouchableOpacity
        accessible={true}
        accessibilityLabel={t('Global.Back')}
        accessibilityRole={'button'}
        testID={testIdWithKey('Back')}
        onPress={previous}
        accessibilityElementsHidden={shouldHideBack()}
        importantForAccessibility={shouldHideBack() ? 'no-hide-descendants' : 'auto'}
        hitSlop={hitSlop}
      >
        <ThemedText
          style={[
            style.pagerNavigationButton,
            { paddingRight: 20, color: shouldHideBack() ? 'transparent' : style.pagerNavigationButton.color },
          ]}
        >
          {previousButtonText}
        </ThemedText>
      </TouchableOpacity>
      <ScalingDot
        data={pages}
        scrollX={scrollX}
        inActiveDotColor={style.pagerDotInactive.color}
        inActiveDotOpacity={1}
        activeDotColor={style.pagerDotActive.color}
        activeDotScale={1}
        dotStyle={style.pagerDot}
        containerStyle={style.pagerPosition}
      />

      <TouchableOpacity
        accessible={true}
        accessibilityLabel={t('Global.Next')}
        accessibilityRole={'button'}
        testID={testIdWithKey('Next')}
        onPress={next}
        accessibilityElementsHidden={shouldHideNext()}
        importantForAccessibility={shouldHideNext() ? 'no-hide-descendants' : 'auto'}
        hitSlop={hitSlop}
      >
        <ThemedText
          style={[
            style.pagerNavigationButton,
            { paddingLeft: 20, color: shouldHideNext() ? 'transparent' : style.pagerNavigationButton.color },
          ]}
        >
          {nextButtonText}
        </ThemedText>
      </TouchableOpacity>
    </View>
  )
}
