import React, { ReactElement, ReactNode, useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'

import { tourMargin } from '../../constants'
import { useTheme } from '../../contexts/theme'
import { RenderProps } from '../../contexts/tour/tour-context'
import { testIdWithKey } from '../../utils/testable'

enum PaginationDotTypes {
  Filled,
  Unfilled,
}

export interface TourBoxProps extends RenderProps {
  children?: ReactNode
  /**
   * Optionally hide the left button
   */
  hideLeft?: boolean
  /**
   * Optionally hide the right button
   */
  hideRight?: boolean
  /**
   * Text for the left button
   */
  leftText?: string
  /**
   * Text for the right button
   */
  rightText?: string
  /**
   * Callback for when the left button is pressed.
   */
  onLeft?: () => void
  /**
   * Callback for when the right button is pressed.
   */
  onRight?: () => void
  title?: string
  /**
   * The 1-indexed step it is on
   */
  stepOn?: number
  /**
   * The 1-indexed number of steps in the current tour
   */
  stepsOutOf?: number
}

/**
 * A built-in TourBox component which can be used as a tooltip container for
 * each step. While it's somewhat customizable, it's not required and can be
 * replaced by your own component.
 *
 * @param props the component props
 * @returns A TourBox React element
 */
export function TourBox(props: TourBoxProps): ReactElement {
  const { t } = useTranslation()
  const {
    leftText = t('Tour.Back'),
    rightText = t('Tour.Next'),
    title,
    hideLeft,
    hideRight,
    onLeft,
    onRight,
    children,
    stop,
    stepOn,
    stepsOutOf,
  } = props
  const { TextTheme, ColorPallet, OnboardingTheme } = useTheme()
  const { width } = useWindowDimensions()
  const iconSize = 30
  const dismissIconName = 'clear'
  const iconColor = ColorPallet.notification.infoIcon
  const [paginationDots, setPaginationDots] = useState<PaginationDotTypes[]>([])
  const [xPos, setXPos] = useState(0)
  const swipeThreshold = 75
  const hitSlop = { top: 20, bottom: 20, left: 50, right: 50 }

  const styles = StyleSheet.create({
    container: {
      backgroundColor: ColorPallet.notification.info,
      borderColor: ColorPallet.notification.infoBorder,
      borderRadius: 5,
      borderWidth: 1,
      padding: 20,
      width: width - tourMargin * 2,
      margin: 'auto',
    },
    headerContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    headerTextContainer: {
      flexGrow: 1,
    },
    headerText: {
      ...TextTheme.headingThree,
      fontWeight: 'bold',
      alignSelf: 'flex-start',
      color: ColorPallet.notification.infoText,
    },
    dismissIcon: {
      alignSelf: 'flex-end',
    },
    body: {
      flex: 1,
      marginVertical: 16,
    },
    footerContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
    },
    navText: {
      ...TextTheme.normal,
      color: ColorPallet.brand.primary,
      fontWeight: 'bold',
    },
    pagerContainer: {
      flexDirection: 'row',
      alignSelf: 'center',
    },
    pagerDot: {
      ...OnboardingTheme.pagerDot,
      borderWidth: 1,
      borderStyle: 'solid',
      width: 10,
      height: 10,
      borderRadius: 5,
      marginHorizontal: 5,
    },
    pagerDotActive: {
      backgroundColor: OnboardingTheme.pagerDotActive.color,
    },
    pagerDotInactive: {
      backgroundColor: 'transparent',
    },
  })

  const handleLeft = useCallback((): void => {
    onLeft?.()
  }, [onLeft])

  const handleRight = useCallback((): void => {
    onRight?.()
  }, [onRight])

  useEffect(() => {
    const arr: PaginationDotTypes[] = []
    if (typeof stepOn === 'number' && typeof stepsOutOf === 'number') {
      for (let i = 1; i <= stepsOutOf; i++) {
        if (i === stepOn) {
          arr.push(PaginationDotTypes.Filled)
        } else {
          arr.push(PaginationDotTypes.Unfilled)
        }
      }
    }

    setPaginationDots(arr)
  }, [])

  return (
    <View
      style={styles.container}
      onTouchStart={(e) => setXPos(e.nativeEvent.pageX)}
      onTouchEnd={(e) => {
        // if swipe right
        if (xPos - e.nativeEvent.pageX > swipeThreshold) {
          handleRight()

          // if swipe left
        } else if (e.nativeEvent.pageX - xPos > swipeThreshold) {
          handleLeft()
        }
      }}
    >
      <View style={styles.headerContainer}>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerText} testID={testIdWithKey('HeaderText')}>
            {title}
          </Text>
        </View>
        <View style={[styles.dismissIcon]} testID={testIdWithKey('Dismiss')}>
          <TouchableOpacity onPress={stop}>
            <Icon name={dismissIconName} size={iconSize} color={iconColor} />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.body}>{children}</View>

      {(!hideLeft || !hideRight) && (
        <View style={styles.footerContainer}>
          {!hideLeft && (
            <TouchableOpacity testID={testIdWithKey('Back')} onPress={handleLeft} hitSlop={hitSlop}>
              <Text style={styles.navText}>{leftText}</Text>
            </TouchableOpacity>
          )}
          <View style={styles.pagerContainer}>
            {paginationDots.map((dot, index) =>
              dot === PaginationDotTypes.Filled ? (
                <View key={index} style={[styles.pagerDot, styles.pagerDotActive]}></View>
              ) : (
                <View key={index} style={[styles.pagerDot, styles.pagerDotInactive]}></View>
              )
            )}
          </View>
          {!hideRight && (
            <TouchableOpacity testID={testIdWithKey('Next')} onPress={handleRight} hitSlop={hitSlop}>
              <Text style={styles.navText}>{rightText}</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  )
}
