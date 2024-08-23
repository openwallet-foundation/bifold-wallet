import React, { useEffect, useState, useRef } from 'react'
import { View, StyleSheet, Text } from 'react-native'

import Button, { ButtonType } from '../../components/buttons/Button'
import { testIdWithKey } from '../../utils/testable'
import { useTheme } from '../../contexts/theme'
import { useTranslation } from 'react-i18next'
import { useAnimatedComponents } from '../../contexts/animated-components'
import InfoTextBox from '../../components/texts/InfoTextBox'
import { InfoBoxType } from '.././misc/InfoBox'
import ProgressBar from './ProgressBar'

type LoadingPlaceholderProps = {
  timeoutDurationInMs?: number
  loadingProgressPercent?: number
  onCancelTouched?: () => void
}

const LoadingPlaceholder: React.FC<LoadingPlaceholderProps> = ({
  timeoutDurationInMs = 10000,
  loadingProgressPercent = 0,
  onCancelTouched,
}) => {
  const { ListItems, TextTheme } = useTheme()
  const { t } = useTranslation()
  const { RecordLoading } = useAnimatedComponents()
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const [overtime, setOvertime] = useState(false)
  const styles = StyleSheet.create({
    container: {
      marginTop: 8,
      marginHorizontal: 20,
    },
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
    slowLoadTitle: {
      ...TextTheme.title,
    },
    slowLoadBody: {
      ...TextTheme.normal,
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
    <>
      {loadingProgressPercent > 0 && <ProgressBar progressPercent={loadingProgressPercent} />}
      <View style={styles.container}>
        <Text style={[TextTheme.label, { textAlign: 'center', fontWeight: 'normal' }]}>
          {'Some key step is going on'}
        </Text>
        <View>
          {overtime && (
            <>
              <InfoTextBox type={InfoBoxType.Info} style={{ marginTop: 20 }}>
                <View style={styles.infoTextBoxContainer}>
                  <Text
                    style={[styles.slowLoadTitle, { fontWeight: 'bold', marginBottom: 10 }]}
                    testID={testIdWithKey('SlowLoadTitle')}
                  >
                    {'This is slower than usual'}
                  </Text>
                  <Text style={[styles.slowLoadBody]} testID={testIdWithKey('SlowLoadBody')}>
                    {'Check your internet connection and try again. '}
                  </Text>
                </View>
              </InfoTextBox>
            </>
          )}

          <Text style={[TextTheme.normal, { marginTop: 25, marginBottom: 10 }]}>
            {"You'll be requested to share the following information."}
          </Text>

          <View style={styles.loadingAnimationContainer}>
            <RecordLoading />
            <RecordLoading style={{ marginTop: 10 }} />
          </View>
        </View>
        {onCancelTouched && (
          <View style={[styles.buttonContainer]}>
            <Button
              title={t('Global.Cancel')}
              accessibilityLabel={t('Global.Cancel')}
              testID={testIdWithKey('Cancel')}
              buttonType={ButtonType.Primary}
              onPress={onCancelTouched}
            />
          </View>
        )}
      </View>
    </>
  )
}

export default LoadingPlaceholder
