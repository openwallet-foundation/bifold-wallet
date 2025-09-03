import React from 'react'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'
import { useTheme } from '../../contexts/theme'
import { ThemedText } from '../texts/ThemedText'

export interface PINHeaderProps {
  updatePin?: boolean
}

const PINHeader = ({ updatePin }: PINHeaderProps) => {
  const { TextTheme } = useTheme()
  const { t } = useTranslation()
  return (
    <View>
      <ThemedText style={{ marginBottom: 16 }}>
        <ThemedText style={{ fontWeight: TextTheme.bold.fontWeight }}>
          {updatePin ? t('PINChange.RememberChangePIN') : t('PINCreate.RememberPIN')}
        </ThemedText>{' '}
        {t('PINCreate.PINDisclaimer')}
      </ThemedText>
    </View>
  )
}

export default PINHeader
