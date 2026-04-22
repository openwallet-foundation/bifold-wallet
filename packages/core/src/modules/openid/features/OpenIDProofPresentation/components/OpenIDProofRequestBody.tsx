import { StyleSheet, View } from 'react-native'

import { useTheme } from '../../../../../contexts/theme'
import { buildFieldsFromW3cCredsCredential } from '../../../../../utils/oca'
import { getCredentialForDisplay } from '../../../display'
import CredentialCardGen from '../../../../../components/misc/CredentialCardGen'
import Record from '../../../../../components/record/Record'
import OpenIDUnsatisfiedProofRequest from '../../../components/OpenIDUnsatisfiedProofRequest'
import { FormattedSubmission } from '../../../types'
import { type SelectedCredentialsFormat } from '../../../types'
import type { OpenIDCredentialRecord } from '../../../credentialRecord'

interface OpenIDProofRequestBodyProps {
  credentialsRequested: OpenIDCredentialRecord[]
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

  const { ColorPalette } = useTheme()

  const styles = StyleSheet.create({
    cardContainer: {
      paddingHorizontal: 12,
      paddingBottom: 24,
    },
    detailContainer: {
      paddingHorizontal: 8,
      paddingVertical: 16,
      backgroundColor: ColorPalette.brand.secondaryBackground,
      marginBottom: 20,
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
      {Object.entries(selectedCredentialsSubmission).map(([inputDescriptorId, credentialSimplified]) => {
        //TODO: Support multiple credentials
        const correspondingSubmission = submission.entries?.find((s) => s.inputDescriptorId === inputDescriptorId)
        const isSatisfied = correspondingSubmission?.isSatisfied
        const credentialSubmission = correspondingSubmission?.credentials.find(
          (s) => s.id === credentialSimplified.id
        )
        const requestedAttributes = credentialSubmission?.requestedAttributes
        const hasMultipleCreds = correspondingSubmission?.credentials ? correspondingSubmission.credentials.length > 1 : false

        
        const credential = credentialsRequested.find((c) => c.id === credentialSubmission?.id)

        if (!credential) {
          return null
        }

        const credentialDisplay = getCredentialForDisplay(credential)
        const fields = buildFieldsFromW3cCredsCredential(credentialDisplay, requestedAttributes)
        


        return (
          <View key={credentialSimplified.id}>
            <View style={styles.cardContainer}>
              {isSatisfied && requestedAttributes &&
                <CredentialCardGen
                  credential={credential}
                  hasAltCredentials={hasMultipleCreds}
                  handleAltCredChange={onPressAltCredChange}
                />
              }
            </View>
            <View style={styles.detailContainer}>
              <Record fields={fields} hideFieldValues header={() => <></>} scrollEnabled={false} />
            </View>
          </View>
        )
      })}
    </View>
  )
}

export default OpenIDProofRequestBody
