import { useTranslation } from 'react-i18next'
import { useTheme } from '../../contexts/theme'
import { View } from 'react-native'
import { ThemedText } from '../texts/ThemedText'

export interface PINCreateHeaderProps {
  updatePin?: boolean
}

const PINCreateHeader = ({ updatePin }: PINCreateHeaderProps) => {
  const { TextTheme } = useTheme()
  const { t } = useTranslation()
  return (
    <View>
      <ThemedText style={{ marginBottom: 16 }}>
        <ThemedText style={{ fontWeight: TextTheme.bold.fontWeight }}>
          {updatePin ? t('PINCreate.RememberChangePIN') : t('PINCreate.RememberPIN')}
        </ThemedText>{' '}
        {t('PINCreate.PINDisclaimer')}
      </ThemedText>
    </View>
  )
}

export default PINCreateHeader
