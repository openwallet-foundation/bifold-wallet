import React from 'react'
import { View, ViewStyle } from 'react-native'
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
  const { ColorPalette, Assets } = useTheme()
  const isError = status === 'error'
  const backgroundColor = isError
    ? (errorBg ?? ColorPalette.brand.credentialCardStatusBadgeErrorBackground)
    : (warnBg ?? ColorPalette.brand.credentialCardStatusBadgeWarningBackground)
  const iconColor = isError
    ? ColorPalette.brand.credentialCardStatusBadgeErrorIcon
    : ColorPalette.brand.credentialCardStatusBadgeWarningIcon
  const StatusIcon = isError ? Assets.svg.credentialRevoked : Assets.svg.credentialNotAvailable

  return (
    <View
      testID={testIdWithKey('CredentialCardStatus')}
      style={[containerStyle, { position: 'absolute', right: 0, top: 0 }]}
    >
      {status ? (
        <View style={[containerStyle, { backgroundColor }]}>
          <StatusIcon height={0.7 * logoHeight} width={0.7 * logoHeight} color={iconColor} fill={iconColor} />
        </View>
      ) : (
        <View style={containerStyle} />
      )}
    </View>
  )
}

export default CredentialCardStatusBadge
