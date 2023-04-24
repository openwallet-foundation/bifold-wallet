import React, { ReactElement, ReactNode, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'

import { tourMargin } from '../../constants'
import { useTheme } from '../../contexts/theme'
import { RenderProps } from '../../contexts/tour/tour-context'
import { testIdWithKey } from '../../utils/testable'

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
  } = props
  const { TextTheme, ColorPallet } = useTheme()
  const { width } = useWindowDimensions()
  const iconSize = 30
  const dismissIconName = 'clear'
  const iconColor = ColorPallet.notification.infoIcon

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
  })

  const handleLeft = useCallback((): void => {
    onLeft?.()
  }, [onLeft])

  const handleRight = useCallback((): void => {
    onRight?.()
  }, [onRight])

  return (
    <View style={styles.container}>
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
            <TouchableOpacity testID={testIdWithKey('Left')} onPress={handleLeft}>
              <Text style={styles.navText}>{leftText}</Text>
            </TouchableOpacity>
          )}
          {!hideRight && (
            <TouchableOpacity testID={testIdWithKey('Right')} onPress={handleRight}>
              <Text style={styles.navText}>{rightText}</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  )
}
