import React, { useEffect, useState, useRef } from 'react'
import { View, StyleSheet, Text } from 'react-native'

import Button, { ButtonType } from '../../components/buttons/Button'
import { testIdWithKey } from '../../utils/testable'
import { useTheme } from '../../contexts/theme'
import { useTranslation } from 'react-i18next'
import { useAnimatedComponents } from '../../contexts/animated-components'
import InfoTextBox from '../../components/texts/InfoTextBox'
import { InfoBoxType } from '.././misc/InfoBox'

type LoadingPlaceholderProps = {
  timeoutDurationInMs: number
  onCancelTouched: () => void
}

const LoadingPlaceholder: React.FC<LoadingPlaceholderProps> = ({ timeoutDurationInMs, onCancelTouched }) => {
  const { ColorPallet, ListItems, TextTheme, HomeTheme } = useTheme()
  const { t } = useTranslation()
  const { RecordLoading } = useAnimatedComponents()
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const [overtime, setOvertime] = useState(false)
  const styles = StyleSheet.create({
    buttonContainer: {
      marginVertical: 25,
    },

    link: {
      ...ListItems.recordAttributeText,
      ...ListItems.recordLink,
      paddingVertical: 2,
    },
    loadingAnimationContainer: {
      flex: 1,
      flexGrow: 1,
      borderRadius: 15,
    },
    noNewUpdatesText: {
      ...HomeTheme.noNewUpdatesText,
      flexWrap: 'wrap',
    },
    infoTextBoxContainer: {
      flexShrink: 1,
    },
  })

  useEffect(() => {
    if (timeoutDurationInMs === 0) {
      return
    }

    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }

    timerRef.current = setTimeout(() => {
      setOvertime(true)
    }, timeoutDurationInMs)

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [timeoutDurationInMs])

  return (
    <View>
      <Text>{'Some key step is going on'}</Text>
      <View>
        {overtime && (
          <>
            <InfoTextBox type={InfoBoxType.Info} style={{ marginTop: 20 }}>
              <View style={styles.infoTextBoxContainer}>
                <Text
                  style={[styles.noNewUpdatesText, { fontWeight: 'bold', marginBottom: 20 }]}
                  testID={testIdWithKey('NoNewUpdates')}
                >
                  {'This is slower than usual'}
                </Text>
                <Text style={[styles.noNewUpdatesText]} testID={testIdWithKey('NoNewUpdates')}>
                  {'Check your internet connection and try again. '}
                </Text>
              </View>
            </InfoTextBox>
          </>
        )}

        <Text style={[styles.noNewUpdatesText, { marginTop: 25, marginBottom: 10 }]}>
          {"You'll be requested to share the following information."}
        </Text>

        <View style={styles.loadingAnimationContainer}>
          <RecordLoading />
          <RecordLoading style={{ marginTop: 10 }} />
        </View>
      </View>

      <View style={[styles.buttonContainer]}>
        <Button
          title={t('Global.Cancel')}
          accessibilityLabel={t('Global.Cancel')}
          testID={testIdWithKey('Cancel')}
          buttonType={ButtonType.Primary}
          onPress={onCancelTouched}
        />
      </View>
    </View>
  )
}

export default LoadingPlaceholder
