import React from 'react'
import { Linking } from 'react-native'
import CredentialActionFooter from './CredentialCard11ActionFooter'

type Props = {
  hasAltCredentials?: boolean
  onChangeAlt?: () => void
  helpActionUrl?: string
  isNotInWallet?: boolean
}

const CredentialCardActionLink: React.FC<Props> = ({
  hasAltCredentials,
  onChangeAlt,
  helpActionUrl,
  isNotInWallet,
}) => {
  if (hasAltCredentials && onChangeAlt) {
    return <CredentialActionFooter onPress={onChangeAlt} text="Change credential" testID="ChangeCredential" />
  }

  if (isNotInWallet && helpActionUrl) {
    return (
      <CredentialActionFooter
        onPress={() => Linking.openURL(helpActionUrl)}
        text="Get this credential"
        testID="GetThisCredential"
      />
    )
  }

  return null
}

export default CredentialCardActionLink
