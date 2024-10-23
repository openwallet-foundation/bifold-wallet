import { StackScreenProps } from '@react-navigation/stack'
import { DeliveryStackParams, Screens } from '../../../types/navigators'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Text } from 'react-native'
import { styles } from 'components/misc/CardWatermark'
import { TextTheme } from '../../../theme'

type OpenIDProofPresentationProps = StackScreenProps<DeliveryStackParams, Screens.OpenIDProofPresentation>

const OpenIDProofPresentation: React.FC<OpenIDProofPresentationProps> = ({ navigation, route }) => {
  const { credential } = route.params

  return (
    <SafeAreaView style={{ flexGrow: 1 }} edges={['bottom', 'left', 'right']}>
      <Text style={TextTheme.normal}> {credential.verifierHostName} requesting the following information</Text>
    </SafeAreaView>
  )
}

export default OpenIDProofPresentation
