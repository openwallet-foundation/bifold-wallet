import React from 'react'
import { useTranslation, Trans } from 'react-i18next'
import { StyleSheet, Text, View } from 'react-native'

import { TextTheme } from '../../../../theme'

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
      <Text style={[TextTheme.normal, styles.pointsBullet]}>{'\u2022'}</Text>
      {pointsTextAxsLabel ? (
        <Text style={[TextTheme.normal, styles.pointsText]} accessibilityLabel={pointsTextAxsLabel}>
          <Trans
            i18nKey={pointsTextAxsKey}
            components={{
              b: <Text style={TextTheme.bold} />,
            }}
            t={t}
          />
        </Text>
      ) : (
        <Text style={[TextTheme.normal, styles.pointsText]}>{pointsText}</Text>
      )}
    </View>
  )
}

export default BulletPoint
