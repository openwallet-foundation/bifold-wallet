import { StyleSheet, Text, View } from 'react-native'
import { MdocRecord, SdJwtVcRecord, W3cCredentialRecord } from '@credo-ts/core'

import { useTheme } from '../../../contexts/theme'
import { buildFieldsFromW3cCredsCredential } from '../../../utils/oca'
import { getCredentialForDisplay } from '../display'
import CredentialCardGen from '../../../components/misc/CredentialCardGen'
import Record from '../../../components/record/Record'

interface OpenIdProofRequestDisplayProps {
  hasMultipleCreds?: boolean
  handleAltCredChange: (...args: any[]) => void
  credential: W3cCredentialRecord | SdJwtVcRecord | MdocRecord | undefined
  submissionName?: string
  submissionPurpose?: string
  isSatisfied?: boolean
  requestedAttributes?: string[]
}

const OpenIdProofRequestDisplay: React.FC<OpenIdProofRequestDisplayProps> = ({
  credential,
  handleAltCredChange,
  hasMultipleCreds,
  isSatisfied,
  requestedAttributes,
  submissionName,
  submissionPurpose,
}) => {

  const { ColorPalette, TextTheme } = useTheme()

  const styles = StyleSheet.create({
    cardContainer: {
      paddingHorizontal: 25,
      paddingVertical: 16,
      backgroundColor: ColorPalette.brand.secondaryBackground,
      marginBottom: 20,
    },
    cardGroupContainer: {
      borderRadius: 8,
      borderWidth: 2,
      borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    cardGroupHeader: {
      padding: 8,
      marginVertical: 8,
    },
  })

  if (!credential) {
    return null
  }

  const credentialDisplay = getCredentialForDisplay(credential)
  const fields = buildFieldsFromW3cCredsCredential(credentialDisplay, requestedAttributes)

  return (
    <View style={styles.cardContainer}>
      <View style={styles.cardGroupContainer}>
        {submissionName && submissionPurpose && (
          <View style={styles.cardGroupHeader}>
            <Text style={TextTheme.bold}>{submissionName}</Text>
            <Text style={TextTheme.labelTitle}>{submissionPurpose}</Text>
          </View>
        )}
        {isSatisfied && requestedAttributes &&
          <>
            <CredentialCardGen
              credential={credential}
              hasAltCredentials={hasMultipleCreds}
              handleAltCredChange={handleAltCredChange}
            />
            <Record fields={fields} />
          </>
        }
      </View>
    </View>
  )

}

export default OpenIdProofRequestDisplay
