import { useTranslation } from 'react-i18next'
import { useTheme } from '../../contexts/theme'
import { Text, View } from 'react-native'

export interface PINCreateHeaderProps {
  updatePin?: boolean
}

const PINCreateHeader = ({ updatePin }: PINCreateHeaderProps) => {
  const { TextTheme } = useTheme()
  const { t } = useTranslation()
  return (
    <View>
      <Text style={[TextTheme.normal, { marginBottom: 16 }]}>
        <Text style={{ fontWeight: TextTheme.bold.fontWeight }}>
          {updatePin ? t('PINCreate.RememberChangePIN') : t('PINCreate.RememberPIN')}
        </Text>{' '}
        {t('PINCreate.PINDisclaimer')}
      </Text>
    </View>
  )
}

export default PINCreateHeader
