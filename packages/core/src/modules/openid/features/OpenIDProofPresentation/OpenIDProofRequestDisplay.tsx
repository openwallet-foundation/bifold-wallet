import { StyleSheet, View, ScrollView } from 'react-native'

import { FormattedSubmission, OpenId4VPRequestRecord } from '../../types'
import OpenIDProofPresentationFooter from './components/OpenIDProofRequestFooter'
import OpenIDProofRequestHeader from './components/OpenIDProofRequestHeader'
import OpenIDProofRequestBody from './components/OpenIDProofRequestBody'
import { OpenIDCredentialRecord } from '../../credentialRecord'

interface OpenIdProofRequestDisplayProps {
  buttonsVisible: boolean
  credential?: OpenId4VPRequestRecord
  credentialsRequested: OpenIDCredentialRecord[]
  onPressAccept: (...args: any[]) => void
  onPressAltCredChange: (inputDescriptorID: string, selectedCredID: string) => void
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
    },
  })

  if (!credential) {
    return null
  }

  return (
    <>
      <ScrollView>
        <View style={styles.container}>
          <OpenIDProofRequestHeader selectedCredentialsSubmission={selectedCredentialsSubmission} verifierName={verifierName} reason={submission?.purpose ?? ''}/>
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
