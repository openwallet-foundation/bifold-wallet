import { useHeaderHeight } from '@react-navigation/elements'
import React from 'react'
import { KeyboardAvoidingView, ScrollView, ScrollViewProps } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useTheme } from '../../contexts/theme'

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
 * @param keyboardAvoiding - Whether to enable keyboard avoidance behavior. When true,
 *   the view will automatically adjust its content when the keyboard appears. Defaults to true.
 * @param scrollViewProps - Additional props to pass to the internal ScrollView component
 */
const KeyboardView: React.FC<{
  children: React.ReactNode
  keyboardAvoiding?: boolean
  scrollViewProps?: ScrollViewProps
}> = ({ children, keyboardAvoiding = true, scrollViewProps }) => {
  const { ColorPalette } = useTheme()
  const headerHeight = useSafeHeaderHeight()
  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: ColorPalette.brand.primaryBackground }}
      edges={['bottom', 'left', 'right']}
    >
      {keyboardAvoiding ? (
        <KeyboardAvoidingView style={{ flex: 1 }} keyboardVerticalOffset={headerHeight} behavior="padding">
          <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps={'handled'}
            {...scrollViewProps}
          >
            {children}
          </ScrollView>
        </KeyboardAvoidingView>
      ) : (
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps={'handled'}>
          {children}
        </ScrollView>
      )}
    </SafeAreaView>
  )
}

export default KeyboardView
