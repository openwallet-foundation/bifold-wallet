import React from 'react'
import { View, ViewStyle } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { testIdWithKey } from '../../utils/testable'
import { useTheme } from '../../contexts/theme'

type Props = {
  status?: string | null // e.g. 'error' | 'warning' | 'check' etc. (whatever you pass today)
  logoHeight: number
  containerStyle: ViewStyle
  errorBg?: string
  warnBg?: string
}

const CredentialCardStatusBadge: React.FC<Props> = ({ status, logoHeight, containerStyle, errorBg, warnBg }) => {
  const { ColorPalette } = useTheme()
  const isError = status === 'error'
  const backgroundColor = isError
    ? (errorBg ?? ColorPalette.brand.credentialCardStatusBadgeErrorBackground)
    : (warnBg ?? ColorPalette.brand.credentialCardStatusBadgeWarningBackground)
  const iconColor = isError
    ? ColorPalette.brand.credentialCardStatusBadgeErrorIcon
    : ColorPalette.brand.credentialCardStatusBadgeWarningIcon

  return (
    <View
      testID={testIdWithKey('CredentialCardStatus')}
      style={[containerStyle, { position: 'absolute', right: 0, top: 0 }]}
    >
      {status ? (
        <View style={[containerStyle, { backgroundColor }]}>
          <Icon size={0.7 * logoHeight} name={status} color={iconColor} />
        </View>
      ) : (
        <View style={containerStyle} />
      )}
    </View>
  )
}

export default CredentialCardStatusBadge
