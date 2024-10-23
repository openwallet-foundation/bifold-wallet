import { StackScreenProps } from '@react-navigation/stack'
import { DeliveryStackParams, Screens } from '../../../types/navigators'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Text } from 'react-native'
import { styles } from 'components/misc/CardWatermark'
import { TextTheme } from '../../../theme'
import { useEffect, useMemo } from 'react'
import { formatDifPexCredentialsForRequest } from '../displayProof'

type OpenIDProofPresentationProps = StackScreenProps<DeliveryStackParams, Screens.OpenIDProofPresentation>

const OpenIDProofPresentation: React.FC<OpenIDProofPresentationProps> = ({ navigation, route }) => {
  const { credential } = route.params

  //   console.log('DUMp Record:', JSON.stringify(credential))
  const submission = useMemo(
    () =>
      credential && credential.credentialsForRequest
        ? formatDifPexCredentialsForRequest(credential.credentialsForRequest)
        : undefined,
    [credential]
  )

  useEffect(() => {
    console.log('$$Submittion:', JSON.stringify(submission))
  }, [submission])
  return (
    <SafeAreaView style={{ flexGrow: 1 }} edges={['bottom', 'left', 'right']}>
      <Text style={TextTheme.normal}> {credential.verifierHostName} requesting the following information</Text>
    </SafeAreaView>
  )
}

export default OpenIDProofPresentation
