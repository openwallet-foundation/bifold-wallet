import React from 'react'
import { TouchableOpacity, Linking } from 'react-native'
import { ThemedText } from '../texts/ThemedText'

type Props = {
  hasAltCredentials?: boolean
  onChangeAlt?: () => void
  helpActionUrl?: string
  textStyle: any // ideally: TextStyle | TextStyle[]
}

const CredentialCardActionLink: React.FC<Props> = ({ hasAltCredentials, onChangeAlt, helpActionUrl, textStyle }) => {
  if (hasAltCredentials && onChangeAlt) {
    return (
      <TouchableOpacity onPress={onChangeAlt} accessibilityLabel="Change credential">
        <ThemedText variant="bold" style={textStyle}>
          Change credential
        </ThemedText>
      </TouchableOpacity>
    )
  }

  if (helpActionUrl) {
    return (
      <TouchableOpacity onPress={() => Linking.openURL(helpActionUrl)} accessibilityLabel="Get this credential">
        <ThemedText variant="bold" style={textStyle}>
          Get this credential
        </ThemedText>
      </TouchableOpacity>
    )
  }

  return null
}

export default CredentialCardActionLink
