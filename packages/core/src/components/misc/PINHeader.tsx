import { View, StyleSheet } from 'react-native'
import { useTranslation } from 'react-i18next'

import { TOKENS, useServices } from '../../container-api'
import { useTheme } from '../../contexts/theme'
import InfoBox, { InfoBoxType } from './InfoBox'
import { ThemedText } from '../texts/ThemedText'

export interface PINHeaderProps {
  updatePin?: boolean
}

const PINHeader = ({ updatePin }: PINHeaderProps) => {
  const { TextTheme } = useTheme()
  const { t } = useTranslation()
  const [{ PINScreensConfig }] = useServices([TOKENS.CONFIG])
  return PINScreensConfig.useNewPINDesign ?
    <View style={style.infoBox}>
      <InfoBox
        title={t('PINCreate.InfoBox.title')}
        message={t('PINCreate.InfoBox.message')}
        notificationType={InfoBoxType.Info}
        renderShowDetails
      />
    </View>
  :
    <View>
      <ThemedText style={style.text}>
        <ThemedText style={{ fontWeight: TextTheme.bold.fontWeight }}>
          {updatePin ? t('PINChange.RememberChangePIN') : t('PINCreate.RememberPIN')}
        </ThemedText>{' '}
        {t('PINCreate.PINDisclaimer')}
      </ThemedText>
    </View>
}

const style = StyleSheet.create({
  infoBox: {
    marginBottom: 24,
  },
  text: {
    marginBottom: 16,
  }
})

export default PINHeader
