import React from 'react'
import { KeyboardAvoidingView, ScrollViewProps, StyleProp, ViewStyle } from 'react-native'
import { Edges, SafeAreaView } from 'react-native-safe-area-context'
import { useHeaderHeight } from '@react-navigation/elements'

import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'

const useSafeHeaderHeight = (): number => {
  try {
    return useHeaderHeight()
  } catch {
    return 100
  }
}

/**
 * A wrapper component that provides keyboard-aware scrolling and safe area handling.
 *
 * This component creates a full-screen container with safe area insets and optional
 * keyboard avoidance behavior. It's designed to be used as a top-level wrapper for
 * screen content that may contain input fields or other interactive elements.
 *
 * @param children - The content to render inside the keyboard view
 * @param edges - The edges to apply the safe area insets to
 * @param scrollViewProps - Additional props to pass to the internal KeyboardAwareScrollView component
 */
const KeyboardView: React.FC<{
  children: React.ReactNode
  edges?: Edges
  style?: StyleProp<ViewStyle>
  scrollViewProps?: ScrollViewProps
}> = ({ children, scrollViewProps, edges = ['bottom', 'left', 'right'], style }) => {
  const safeHeaderHeight = useSafeHeaderHeight()

  return (
    <SafeAreaView style={style} edges={edges}>
      <KeyboardAvoidingView style={{ flex: 1 }} keyboardVerticalOffset={safeHeaderHeight} behavior="padding">
        <KeyboardAwareScrollView
          keyboardShouldPersistTaps={'handled'}
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          {...scrollViewProps}
        >
          {children}
        </KeyboardAwareScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

export default KeyboardView
