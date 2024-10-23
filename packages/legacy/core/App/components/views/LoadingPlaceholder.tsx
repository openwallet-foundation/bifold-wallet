import React, { useCallback, useEffect, useState, useRef } from 'react'
import { View, StyleSheet, Text, ScrollView } from 'react-native'

import Button, { ButtonType } from '../../components/buttons/Button'
import { testIdWithKey } from '../../utils/testable'
import { useTheme } from '../../contexts/theme'
import { useTranslation } from 'react-i18next'
import InfoTextBox from '../../components/texts/InfoTextBox'
import { InfoBoxType } from '.././misc/InfoBox'
import ProgressBar from './ProgressBar'
import RecordLoading from '../animated/RecordLoading'
import { SafeAreaView } from 'react-native-safe-area-context'

export const LoadingPlaceholderWorkflowType = {
  Connection: 'Connection',
  ReceiveOffer: 'ReceiveOffer',
  ProofRequested: 'ProofRequested',
} as const

type LoadingPlaceholderProps = {
  workflowType: (typeof LoadingPlaceholderWorkflowType)[keyof typeof LoadingPlaceholderWorkflowType]
  timeoutDurationInMs?: number
  loadingProgressPercent?: number
  onCancelTouched?: () => void
  onTimeoutTriggered?: () => void
  testID?: string
}

// TODO:(jl) Add `AccessibilityInfo.announceForAccessibility(t('Connection.TakingTooLong'))
// when the timeout is triggered.

const LoadingPlaceholder: React.FC<LoadingPlaceholderProps> = ({
  workflowType,
  timeoutDurationInMs = 10000,
  loadingProgressPercent = 0,
  onCancelTouched,
  onTimeoutTriggered,
  testID,
}) => {
  const { ListItems, TextTheme } = useTheme()
  const { t } = useTranslation()
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const [overtime, setOvertime] = useState(false)
  const styles = StyleSheet.create({
    safeAreaView: {
      flex: 1,
    },
    container: {
      flex: 1,
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
      if (onTimeoutTriggered) {
        onTimeoutTriggered()
      }
    }, timeoutDurationInMs)

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [timeoutDurationInMs, onTimeoutTriggered])

  const textForProgressIndication = useCallback(() => {
    switch (workflowType) {
      case LoadingPlaceholderWorkflowType.Connection:
        return t('LoadingPlaceholder.Connecting')
      case LoadingPlaceholderWorkflowType.ProofRequested:
        return t('LoadingPlaceholder.ProofRequest')
      case LoadingPlaceholderWorkflowType.ReceiveOffer:
        return t('LoadingPlaceholder.CredentialOffer')
    }
  }, [workflowType, t])

  const textForWorkflowType = useCallback(() => {
    switch (workflowType) {
      case LoadingPlaceholderWorkflowType.ProofRequested:
        return t('LoadingPlaceholder.YourRequest')
      case LoadingPlaceholderWorkflowType.ReceiveOffer:
        return t('LoadingPlaceholder.YourOffer')
      default:
        return t('LoadingPlaceholder.Connecting')
    }
  }, [workflowType, t])

  return (
    <SafeAreaView
      style={styles.safeAreaView}
      testID={testID ?? testIdWithKey('LoadingPlaceholder')}
      edges={['bottom', 'left', 'right']}
    >
      <ScrollView>
        {loadingProgressPercent > 0 && <ProgressBar progressPercent={loadingProgressPercent} />}
        <View style={styles.container}>
          <Text style={[TextTheme.label, { textAlign: 'center', fontWeight: 'normal' }]}>
            {textForProgressIndication()}
          </Text>
          {overtime && (
            <>
              <InfoTextBox type={InfoBoxType.Info} style={{ marginTop: 20 }}>
                <View style={styles.infoTextBoxContainer}>
                  <Text
                    style={[styles.slowLoadTitle, { fontWeight: 'bold', marginBottom: 10 }]}
                    testID={testIdWithKey('SlowLoadTitle')}
                  >
                    {t('LoadingPlaceholder.SlowLoadingTitle')}
                  </Text>
                  <Text style={[styles.slowLoadBody]} testID={testIdWithKey('SlowLoadBody')}>
                    {t('LoadingPlaceholder.SlowLoadingBody')}
                  </Text>
                </View>
              </InfoTextBox>
            </>
          )}

          <Text style={[TextTheme.normal, { marginTop: 25, marginBottom: 10 }]}>{textForWorkflowType()}</Text>

          <View style={styles.loadingAnimationContainer}>
            <RecordLoading />
            <RecordLoading style={{ marginTop: 10 }} />
          </View>
          {onCancelTouched && (
            <View style={styles.buttonContainer}>
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
      </ScrollView>
    </SafeAreaView>
  )
}

export default LoadingPlaceholder
