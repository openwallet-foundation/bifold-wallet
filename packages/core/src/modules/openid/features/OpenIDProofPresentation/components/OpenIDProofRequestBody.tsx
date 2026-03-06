import { StyleSheet, Text, View } from 'react-native'
import { MdocRecord, SdJwtVcRecord, W3cCredentialRecord } from '@credo-ts/core'

import { useTheme } from '../../../../../contexts/theme'
import { buildFieldsFromW3cCredsCredential } from '../../../../../utils/oca'
import { getCredentialForDisplay } from '../../../display'
import CredentialCardGen from '../../../../../components/misc/CredentialCardGen'
import Record from '../../../../../components/record/Record'
import OpenIDUnsatisfiedProofRequest from '../../../components/OpenIDUnsatisfiedProofRequest'
import { FormattedSubmission } from '../../../displayProof'
import { type SelectedCredentialsFormat } from '../../../types'

interface OpenIDProofRequestBodyProps {
  credentialsRequested: (SdJwtVcRecord | W3cCredentialRecord | MdocRecord)[]
  onPressAltCredChange: (...args: any[]) => void
  selectedCredentialsSubmission?: SelectedCredentialsFormat
  submission?: FormattedSubmission
  verifierName: string
}

const OpenIDProofRequestBody: React.FC<OpenIDProofRequestBodyProps> = ({
  credentialsRequested,
  onPressAltCredChange,
  selectedCredentialsSubmission,
  submission,
  verifierName,
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
    credentialsList: {
      marginTop: 20,
      justifyContent: 'space-between',
    },
  })

  if (submission && !submission.areAllSatisfied) {
    return (
      <OpenIDUnsatisfiedProofRequest
        credentialName={submission?.name}
        requestPurpose={submission?.purpose}
        verifierName={verifierName}
      />
    )
  }

  if (!selectedCredentialsSubmission || !submission) return

  return (
    <View style={styles.credentialsList}>
      {Object.entries(selectedCredentialsSubmission).map(([inputDescriptorId, credentialSimplified], i) => {
        //TODO: Support multiple credentials
        const globalSubmissionName = submission.name
        const globalSubmissionPurpose = submission.purpose
        const correspondingSubmission = submission.entries?.find((s) => s.inputDescriptorId === inputDescriptorId)
        const submissionName = correspondingSubmission?.name
        const submissionPurpose = correspondingSubmission?.purpose
        const isSatisfied = correspondingSubmission?.isSatisfied
        const credentialSubmission = correspondingSubmission?.credentials.find(
          (s) => s.id === credentialSimplified.id
        )
        const requestedAttributes = credentialSubmission?.requestedAttributes
        const hasMultipleCreds = correspondingSubmission?.credentials ? correspondingSubmission.credentials.length > 1 : false

        const name = submissionName || globalSubmissionName || undefined
        const purpose = submissionPurpose || globalSubmissionPurpose || undefined
        
        const credential = credentialsRequested.find((c) => c.id === credentialSubmission?.id)

        if (!credential) {
          return null
        }

        const credentialDisplay = getCredentialForDisplay(credential)
        const fields = buildFieldsFromW3cCredsCredential(credentialDisplay, requestedAttributes)
        


        return (
          <View key={i}>
            <View style={styles.cardContainer}>
              <View style={styles.cardGroupContainer}>
                {name && purpose && (
                  <View style={styles.cardGroupHeader}>
                    <Text style={TextTheme.bold}>{name}</Text>
                    <Text style={TextTheme.labelTitle}>{purpose}</Text>
                  </View>
                )}
                {isSatisfied && requestedAttributes &&
                  <CredentialCardGen
                    credential={credential}
                    hasAltCredentials={hasMultipleCreds}
                    handleAltCredChange={onPressAltCredChange}
                  />
                }
              </View>
              <Record fields={fields} />
            </View>
          </View>
        )
      })}
    </View>
  )
}

export default OpenIDProofRequestBody
