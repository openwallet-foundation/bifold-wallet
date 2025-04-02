import React from 'react'
import { useTranslation, Trans } from 'react-i18next'
import { StyleSheet, View } from 'react-native'

import { ThemedText } from '../../../../components/texts/ThemedText'

interface Props {
  pointsText?: string
  pointsTextAxsLabel?: string
  pointsTextAxsKey?: any
}

const styles = StyleSheet.create({
  pointsView: {
    flexDirection: 'row',
  },
  pointsBullet: {
    paddingLeft: 8,
  },
  pointsText: {
    flex: 1,
    paddingLeft: 8,
  },
})

const BulletPoint: React.FC<Props> = ({ pointsText, pointsTextAxsLabel, pointsTextAxsKey }) => {
  const { t } = useTranslation()

  return (
    <View style={styles.pointsView} accessible={true}>
      <ThemedText style={styles.pointsBullet}>{'\u2022'}</ThemedText>
      {pointsTextAxsLabel ? (
        <ThemedText style={styles.pointsText} accessibilityLabel={pointsTextAxsLabel}>
          <Trans
            i18nKey={pointsTextAxsKey}
            components={{
              b: <ThemedText variant="bold" />,
            }}
            t={t}
          />
        </ThemedText>
      ) : (
        <ThemedText style={styles.pointsText}>{pointsText}</ThemedText>
      )}
    </View>
  )
}

export default BulletPoint
