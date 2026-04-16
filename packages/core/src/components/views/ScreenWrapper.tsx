import React, { ComponentProps, RefObject } from 'react'
import { ScrollView, StyleProp, StyleSheet, View, ViewStyle } from 'react-native'

import { Edges, SafeAreaView } from 'react-native-safe-area-context'
import { useTheme } from '../../contexts/theme'
import KeyboardView from './KeyboardView'

interface ScreenWrapperProps {
  children: React.ReactNode
  controls?: React.ReactNode
  /**
   * Whether to use KeyboardView to handle keyboard interactions
   * @default false
   */
  keyboardActive?: boolean
  /**
   * Safe area edges to respect
   * @default ['bottom', 'left', 'right']
   */
  edges?: Edges
  /**
   * Additional style for the container
   */
  style?: StyleProp<ViewStyle>
  /**
   * Whether to wrap children in a ScrollView
   * @default true
   */
  scrollable?: boolean
  /**
   * Style for the ScrollView content container
   */
  scrollViewContainerStyle?: ComponentProps<typeof ScrollView>['contentContainerStyle']
  /**
   * Style for the controls container at the bottom
   */
  controlsContainerStyle?: StyleProp<ViewStyle>
  /**
   * Apply standard padding (Spacing.md) to content and controls
   * @default true
   */
  padded?: boolean
  /**
   * Ref for the ScrollView. This allows parent components to control scrolling behaviour
   */
  scrollViewRef?: RefObject<ScrollView | null>
}

/**
 * Wraps content in a SafeAreaView and optionally a KeyboardView, and provides a container for controls.
 */
const ScreenWrapper: React.FC<ScreenWrapperProps> = ({
  children,
  controls,
  keyboardActive = false,
  edges = ['bottom', 'left', 'right'],
  style,
  scrollable = true,
  scrollViewContainerStyle,
  controlsContainerStyle,
  padded = true,
  scrollViewRef,
}) => {
  const { Spacing, ColorPalette } = useTheme()

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: ColorPalette.brand.primaryBackground,
    },
  })

  // Build scroll content style
  const scrollStyle: StyleProp<ViewStyle> = [padded && { padding: Spacing.md }, scrollViewContainerStyle]

  // Build controls style with automatic gap between buttons
  const controlsStyle: StyleProp<ViewStyle> = [
    { gap: Spacing.md },
    padded && { paddingHorizontal: Spacing.md, paddingBottom: Spacing.md },
    controlsContainerStyle,
  ]

  const renderScrollableContent = () => {
    if (!scrollable) {
      return children
    }

    return (
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={scrollStyle} ref={scrollViewRef}>
        {children}
      </ScrollView>
    )
  }

  // KeyboardView uses KeyboardAwareScrollView from react-native-keyboard-controller
  // which handles both keyboard avoidance and scrolling
  if (keyboardActive) {
    return (
      <SafeAreaView style={[styles.container, style]} edges={edges}>
        <KeyboardView scrollViewRef={scrollViewRef}>
          <View style={scrollStyle}>{children}</View>
          {controls && <View style={[controlsStyle, { marginTop: 'auto' }]}>{controls}</View>}
        </KeyboardView>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={[styles.container, style]} edges={edges}>
      {renderScrollableContent()}
      {controls && <View style={controlsStyle}>{controls}</View>}
    </SafeAreaView>
  )
}

export default ScreenWrapper
