import React from 'react'
import { View, ViewStyle } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { testIdWithKey } from '../../utils/testable'

type Props = {
  status?: string | null // e.g. 'error' | 'warning' | 'check' etc. (whatever you pass today)
  logoHeight: number
  containerStyle: ViewStyle
  errorBg?: string
  warnBg?: string
}

const CredentialCardStatusBadge: React.FC<Props> = ({
  status,
  logoHeight,
  containerStyle,
  errorBg = '#FDECEA',
  warnBg = '#FFF8E1',
}) => {
  return (
    <View
      testID={testIdWithKey('CredentialCardStatus')}
      style={[containerStyle, { position: 'absolute', right: 0, top: 0 }]}
    >
      {status ? (
        <View style={[containerStyle, { backgroundColor: status === 'error' ? errorBg : warnBg }]}>
          <Icon size={0.7 * logoHeight} name={status} />
        </View>
      ) : (
        <View style={containerStyle} />
      )}
    </View>
  )
}

export default CredentialCardStatusBadge
