import React from 'react'
import { useTranslation } from 'react-i18next'
import { AccessibilityActionEvent, AccessibilityProps, Linking } from 'react-native'
import CredentialActionFooter from './CredentialCard11ActionFooter'

const CHANGE_CREDENTIAL_ACTION = 'changeCredential'

type Props = {
  hasAltCredentials?: boolean
  onChangeAlt?: () => void
  helpActionUrl?: string
  isNotInWallet?: boolean
}

/**
 * A credential card reads as one element to screen readers, which hides its "Change credential"
 * link from VoiceOver. Spread the returned props onto that element to offer the link as an action.
 */
export const useChangeCredentialAccessibilityActions = (
  hasAltCredentials?: boolean,
  onChangeAlt?: () => void
): Pick<AccessibilityProps, 'accessibilityActions' | 'onAccessibilityAction'> => {
  const { t } = useTranslation()

  if (!hasAltCredentials || !onChangeAlt) {
    return {}
  }

  return {
    accessibilityActions: [{ name: CHANGE_CREDENTIAL_ACTION, label: t('ProofRequest.ChangeCredential') }],
    onAccessibilityAction: (event: AccessibilityActionEvent) => {
      if (event.nativeEvent.actionName === CHANGE_CREDENTIAL_ACTION) {
        onChangeAlt()
      }
    },
  }
}

const CredentialCardActionLink: React.FC<Props> = ({
  hasAltCredentials,
  onChangeAlt,
  helpActionUrl,
  isNotInWallet,
}) => {
  const { t } = useTranslation()

  if (hasAltCredentials && onChangeAlt) {
    return (
      <CredentialActionFooter
        onPress={onChangeAlt}
        text={t('ProofRequest.ChangeCredential')}
        testID="ChangeCredential"
      />
    )
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
