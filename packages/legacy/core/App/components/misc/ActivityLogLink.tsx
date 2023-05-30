import React from 'react'
import { useTranslation } from 'react-i18next'
import { View, Text, StyleSheet } from 'react-native'

import { useTheme } from '../../contexts/theme'
import { testIdWithKey } from '../../utils/testable'

const ActivityLogLink: React.FC = () => {
  const { ColorPallet } = useTheme()
  const { t } = useTranslation()
  const styles = StyleSheet.create({
    textContainer: {
      flexDirection: 'row',
    },
    text: {
      color: ColorPallet.notification.infoText,
    },
    link: {
      color: ColorPallet.notification.infoText,
      textDecorationLine: 'underline',
    },
  })
  return (
    <View style={styles.textContainer} testID={testIdWithKey('ActivityLogLink')}>
      <Text style={styles.text}>{t('ActivityLog.Your')}</Text>
      <Text> </Text>
      <Text style={styles.link}>{t('ActivityLog.Activity')}</Text>
      <Text> </Text>
      <Text style={styles.text}>{t('ActivityLog.Updated')}</Text>
    </View>
  )
}

export default ActivityLogLink
