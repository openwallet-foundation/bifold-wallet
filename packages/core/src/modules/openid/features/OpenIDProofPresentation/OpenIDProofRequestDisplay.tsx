import { StyleSheet, View, ScrollView } from 'react-native'
import { MdocRecord, SdJwtVcRecord, W3cCredentialRecord } from '@credo-ts/core'

import { FormattedSubmission } from '../../displayProof'
import OpenIDProofPresentationFooter from './components/OpenIDProofRequestFooter'
import OpenIDProofRequestHeader from './components/OpenIDProofRequestHeader'
import OpenIDProofRequestBody from './components/OpenIDProofRequestBody'
import { OpenId4VPRequestRecord } from '../../types'

interface OpenIdProofRequestDisplayProps {
  buttonsVisible: boolean
  credential: W3cCredentialRecord | SdJwtVcRecord | MdocRecord | OpenId4VPRequestRecord | undefined
  credentialsRequested: (SdJwtVcRecord | W3cCredentialRecord | MdocRecord)[]
  onPressAccept: (...args: any[]) => void
  onPressAltCredChange: (...args: any[]) => void
  onPressDecline: (...args: any[]) => void
  onPressDismiss: (...args: any[]) => void
  selectedCredentialsSubmission?: SelectedCredentialsFormat
  submission?: FormattedSubmission
  verifierName: any
}

interface SelectedCredentialsFormat {
  [inputDescriptorId: string]: {
    id: string
    claimFormat: string
  }
}

const OpenIdProofRequestDisplay: React.FC<OpenIdProofRequestDisplayProps> = ({
  buttonsVisible,
  credential,
  credentialsRequested,
  onPressAltCredChange,
  onPressAccept,
  onPressDecline,
  onPressDismiss,
  selectedCredentialsSubmission,
  submission,
  verifierName
}) => {

  const styles = StyleSheet.create({
    container: {
      flexGrow: 1,
      justifyContent: 'space-between',
      padding: 10,
    },
  })

  if (!credential) {
    return null
  }

  return (
    <>
      <ScrollView>
        <View style={styles.container}>
          <OpenIDProofRequestHeader selectedCredentialsSubmission={selectedCredentialsSubmission} verifierName={verifierName} />
          <OpenIDProofRequestBody
            credentialsRequested={credentialsRequested}
            onPressAltCredChange={onPressAltCredChange}
            selectedCredentialsSubmission={selectedCredentialsSubmission}
            submission={submission}
            verifierName={verifierName}
          />
        </View>
      </ScrollView>
      <OpenIDProofPresentationFooter
        buttonsVisible={buttonsVisible}
        credential={credential}
        onPressAccept={onPressAccept}
        onPressDecline={onPressDecline}
        onPressDismiss={onPressDismiss}
        selectedCredentialsSubmission={selectedCredentialsSubmission}
        submission={submission}
      />
    </>
  )
}

export default OpenIdProofRequestDisplay
