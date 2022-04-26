import React from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, Text } from 'react-native'

import { useTheme } from '../../contexts/theme'
import { testIdWithKey } from '../../utils/testable'
import InfoTextBox from '../texts/InfoTextBox'

const NoNewUpdates: React.FC = () => {
  const { t } = useTranslation()
  const { ColorPallet, TextTheme } = useTheme()
  const styles = StyleSheet.create({
    text: {
      ...TextTheme.normal,
      color: ColorPallet.notification.infoText,
    },
  })
  return (
    <InfoTextBox>
      <Text style={[styles.text]} testID={testIdWithKey('NoNewUpdates')}>
        {t('Home.NoNewUpdates')}
      </Text>
    </InfoTextBox>
  )
}

export default NoNewUpdates
