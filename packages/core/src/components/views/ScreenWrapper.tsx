import React, { ComponentProps } from 'react'
import { ScrollView, StyleProp, StyleSheet, View, ViewStyle } from 'react-native'

import KeyboardView from './KeyboardView'
import { useTheme } from '../../contexts/theme'
import { Edges, SafeAreaView } from 'react-native-safe-area-context'

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
   * @default false
   */
  padded?: boolean
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
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={scrollStyle}>
        {children}
      </ScrollView>
    )
  }

  // KeyboardView has its own SafeAreaView, so we don't need to double-wrap
  if (keyboardActive) {
    return (
      <KeyboardView style={[styles.container, style]} edges={edges}>
        <View style={scrollStyle}>{children}</View>
        {controls && <View style={[controlsStyle, { marginTop: 'auto' }]}>{controls}</View>}
      </KeyboardView>
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
