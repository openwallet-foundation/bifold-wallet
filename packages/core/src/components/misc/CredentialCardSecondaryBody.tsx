import React from 'react'
import { View, ImageBackground, ViewStyle } from 'react-native'
import { testIdWithKey } from '../../utils/testable'

type Props = {
  hideSlice?: boolean
  secondaryBg?: string | null
  backgroundSliceUri?: string | null
  borderRadius: number
  containerStyle: ViewStyle
}

const CredentialCardSecondaryBody: React.FC<Props> = ({
  hideSlice,
  secondaryBg,
  backgroundSliceUri,
  borderRadius,
  containerStyle,
}) => {
  if (hideSlice) {
    return (
      <View
        testID={testIdWithKey('CredentialCardSecondaryBody')}
        style={[containerStyle, { backgroundColor: 'transparent', overflow: 'hidden' }]}
      />
    )
  }

  const bg = secondaryBg ?? (containerStyle as any)?.backgroundColor ?? 'transparent'

  return (
    <View
      testID={testIdWithKey('CredentialCardSecondaryBody')}
      style={[containerStyle, { backgroundColor: bg, overflow: 'hidden' }]}
    >
      {backgroundSliceUri ? (
        <ImageBackground
          source={{ uri: backgroundSliceUri }}
          style={{ flexGrow: 1 }}
          imageStyle={{ borderTopLeftRadius: borderRadius, borderBottomLeftRadius: borderRadius }}
        />
      ) : null}
    </View>
  )
}

export default CredentialCardSecondaryBody
