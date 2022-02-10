import React from 'react'
import { useTranslation } from 'react-i18next'
import { Animated, Text, TouchableOpacity, View } from 'react-native'
import { ScalingDot } from 'react-native-animated-pagination-dots'

import { Colors } from '../../theme'

interface IPaginationStyleSheet {
  pagerContainer: Record<string, any>
  pagerDot: Record<string, any>
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

  const shouldHideBack = () => {
    if (activeIndex === 0) {
      return true
    }
  }
  const shouldHideNext = () => {
    if (activeIndex === pages.length - 1) {
      return true
    }
  }

  // FIXME: Issue #204. Better to `disable` the `TouchableOpacity`
  // controls rather than changing the color to transparent.

  return (
    <View style={style.pagerContainer}>
      <TouchableOpacity
        testID={'backButton'}
        accessible={true}
        accessibilityLabel={t('Global.Back')}
        accessibilityElementsHidden={false}
        onPress={previous}
      >
        <Text
          style={[
            style.pagerNavigationButton,
            { paddingRight: 20, color: shouldHideBack() ? 'transparent' : style.pagerNavigationButton.color },
          ]}
        >
          {previousButtonText}
        </Text>
      </TouchableOpacity>
      <ScalingDot
        data={pages}
        scrollX={scrollX}
        inActiveDotColor={Colors.transparent}
        inActiveDotOpacity={1}
        activeDotColor={Colors.primary}
        activeDotScale={1}
        dotStyle={style.pagerDot}
        containerStyle={style.pagerPosition}
      />
      <TouchableOpacity testID={'nextButton'} accessible={true} accessibilityLabel={t('Global.Next')} onPress={next}>
        <Text
          style={[
            style.pagerNavigationButton,
            { paddingLeft: 20, color: shouldHideNext() ? 'transparent' : style.pagerNavigationButton.color },
          ]}
        >
          {nextButtonText}
        </Text>
      </TouchableOpacity>
    </View>
  )
}
