import React from 'react'
import { KeyboardAvoidingView, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useTheme } from '../../contexts/theme'
import { useHeaderHeight } from '@react-navigation/elements'

const useSafeHeaderHeight = (): number => {
  try {
    return useHeaderHeight()
  } catch {
    return 100
  }
}

const KeyboardView: React.FC<{ children: React.ReactNode; keyboardAvoiding?: boolean }> = ({
  children,
  keyboardAvoiding = true,
}) => {
  const { ColorPallet } = useTheme()
  const headerHeight = useSafeHeaderHeight()
  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: ColorPallet.brand.primaryBackground }}
      edges={['bottom', 'left', 'right']}
    >
      {keyboardAvoiding ? (
        <KeyboardAvoidingView style={{ flex: 1 }} keyboardVerticalOffset={headerHeight} behavior="padding">
          <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps={'handled'}>
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
