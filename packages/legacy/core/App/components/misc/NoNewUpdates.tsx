import React from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, View } from 'react-native'

import { useTheme } from '../../contexts/theme'
import { testIdWithKey } from '../../utils/testable'
import InfoTextBox from '../texts/InfoTextBox'
import { ThemedText } from '../texts/ThemedText'

const NoNewUpdates: React.FC = () => {
  const { t } = useTranslation()
  const { HomeTheme, ColorPallet } = useTheme()
  const styles = StyleSheet.create({
    noNewUpdatesContainer: {
      paddingHorizontal: 20,
      paddingVertical: 20,
      backgroundColor: ColorPallet.brand.secondaryBackground,
    },
    noNewUpdatesText: {
      ...HomeTheme.noNewUpdatesText,
      alignSelf: 'center',
      flex: 1,
      flexWrap: 'wrap',
    },
  })

  return (
    <View style={styles.noNewUpdatesContainer}>
      <InfoTextBox>
        <ThemedText style={styles.noNewUpdatesText} testID={testIdWithKey('NoNewUpdates')}>
          {t('Home.NoNewUpdates')}
        </ThemedText>
      </InfoTextBox>
    </View>
  )
}

export default NoNewUpdates
