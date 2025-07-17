import React from 'react'
import { KeyboardAvoidingView, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useTheme } from '../../contexts/theme'

const KeyboardView: React.FC<{ children: React.ReactNode; keyboardAvoiding?: boolean }> = ({
  children,
  keyboardAvoiding = true,
}) => {
  const { ColorPallet } = useTheme()
  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: ColorPallet.brand.primaryBackground }}
      edges={['bottom', 'left', 'right']}
    >
      {keyboardAvoiding ? (
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          // below property is the distance to account for between the top of the screen and the top of the view. It is at most 100 with max zoom + font settings
          keyboardVerticalOffset={100}
          behavior="padding"
        >
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
