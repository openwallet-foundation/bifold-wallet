import { SafeAreaView } from 'react-native-safe-area-context'
import FauxHeader from '../../components/misc/FauxHeader'
import SafeAreaModal from '../../components/modals/SafeAreaModal'
import { useTheme } from '../../contexts/theme'
import PINVerify, { PINEntryUsage } from '../../screens/PINVerify'

interface VerifyPINModalProps {
  title: string
  onBackPressed: () => void
  onAuthenticationComplete: (...args: any[]) => void | boolean
  onCancelAuth: () => void
  PINVerifyModalUsage: PINEntryUsage
  visible: boolean
}

const VerifyPINModal: React.FC<VerifyPINModalProps> = ({
  title = '',
  onBackPressed = () => {},
  onAuthenticationComplete = () => {},
  onCancelAuth = () => {},
  PINVerifyModalUsage = PINEntryUsage.ChangePIN,
  visible = false,
}: VerifyPINModalProps) => {
  const { ColorPalette, NavigationTheme } = useTheme()
  return (
    <SafeAreaModal
      style={{ backgroundColor: ColorPalette.brand.primaryBackground }}
      visible={visible}
      transparent={false}
      animationType={PINVerifyModalUsage === PINEntryUsage.ChangePIN ? 'none' : 'slide'}
      presentationStyle={'fullScreen'}
      statusBarTranslucent={true}
    >
      <SafeAreaView edges={['top']} style={{ backgroundColor: NavigationTheme.colors.primary }} />
      <FauxHeader title={title} onBackPressed={onBackPressed} />
      <PINVerify usage={PINVerifyModalUsage} setAuthenticated={onAuthenticationComplete} onCancelAuth={onCancelAuth} />
    </SafeAreaModal>
  )
}

export default VerifyPINModal
