import React from 'react'
import { Platform, KeyboardAvoidingView, ScrollViewProps } from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller'
import { useHeaderHeight } from '@react-navigation/elements'

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
 * @param scrollViewProps - Additional props to pass to the internal KeyboardAwareScrollView component
 */
const KeyboardView: React.FC<{
  children: React.ReactNode
  scrollViewProps?: ScrollViewProps
}> = ({ children, scrollViewProps }) => {
  const safeHeaderHeight = useSafeHeaderHeight()

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      keyboardVerticalOffset={safeHeaderHeight}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <KeyboardAwareScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[{ flexGrow: 1 }, scrollViewProps?.contentContainerStyle]}
        showsVerticalScrollIndicator={false}
        {...scrollViewProps}
      >
        {children}
      </KeyboardAwareScrollView>
    </KeyboardAvoidingView>
  )
}

export default KeyboardView
