import { StackScreenProps } from '@react-navigation/stack'
import { DeliveryStackParams, Screens } from '../../../types/navigators'

type OpenIDProofPresentationProps = StackScreenProps<DeliveryStackParams, Screens.OpenIDCredentialDetails>

const OpenIDProofPresentation: React.FC<OpenIDProofPresentationProps> = ({ navigation, route }) => {}
