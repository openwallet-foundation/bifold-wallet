import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ScrollView, StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import moment from 'moment'
import Button, { ButtonType } from '../components/buttons/Button'
import InfoTextBox from '../components/texts/InfoTextBox'
import { ThemedText } from '../components/texts/ThemedText'
import { DispatchAction } from '../contexts/reducers/store'
import { useStore } from '../contexts/store'
import { useTheme } from '../contexts/theme'
import { testIdWithKey } from '../utils/testable'

interface Timer {
  hours: number
  minutes: number
  seconds: number
}

const AttemptLockout: React.FC = () => {
  const { ColorPalette, Assets, Spacing } = useTheme()
  const { t } = useTranslation()
  const [state, dispatch] = useStore()
  const [time, setTime] = useState<Timer>()
  const [timeoutDone, setTimeoutDone] = useState<boolean>(false)
  const lockoutDate = useRef(state.loginAttempt.lockoutDate)

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: ColorPalette.brand.primaryBackground,
      paddingHorizontal: Spacing.md,
    },
    title: {
      textAlign: 'center',
      marginBottom: Spacing.lg,
    },
    description: {
      textAlign: 'center',
      marginBottom: Spacing.lg,
    },
    actionContainer: {
      marginBottom: Spacing.lg,
    },
    tryAgain: {
      textAlign: 'center',
    },
    countDown: {
      textAlign: 'center',
    },
    image: {
      width: 150,
      height: 150,
      marginVertical: Spacing.lg,
      alignSelf: 'center',
    },
  })

  const getTimeRemaining = () => {
    const timeDifference = moment(lockoutDate.current).diff(moment())
    const duration = moment.duration(timeDifference)

    if (timeDifference > 0) {
      const hours = Math.floor(duration.asHours())
      const minutes = duration.minutes()
      const seconds = duration.seconds()

      setTime({ hours, minutes, seconds })
    } else {
      setTimeoutDone(true)
    }
  }

  // Initialize hours, minutes and seconds before time starts
  useEffect(() => {
    getTimeRemaining()
  }, [])

  // make sure set timeout only runs once
  useEffect(() => {
    const updateTimer = setTimeout(() => {
      // calculate time remaining
      getTimeRemaining()
      if (timeoutDone) {
        clearInterval(updateTimer)
      }
    }, 1000)
    return () => clearInterval(updateTimer)
  }, [timeoutDone, time])

  const unlock = useCallback(async () => {
    dispatch({
      type: DispatchAction.ATTEMPT_UPDATED,
      payload: [{ loginAttempts: state.loginAttempt.loginAttempts, lockoutDate: undefined, servedPenalty: true }],
    })
  }, [dispatch, state.loginAttempt.loginAttempts])

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
        <Assets.svg.appLockout style={styles.image} />
        <ThemedText variant="headingThree" style={styles.title}>
          {t('AttemptLockout.Title')}
        </ThemedText>
        <ThemedText style={styles.description}>{t('AttemptLockout.Description')}</ThemedText>
        <View style={styles.actionContainer}>
          {timeoutDone ? (
            <Button
              title={t('Global.TryAgain')}
              buttonType={ButtonType.Primary}
              testID={testIdWithKey('Enter')}
              accessibilityLabel={t('Global.TryAgain')}
              onPress={unlock}
            />
          ) : (
            <View>
              <ThemedText style={styles.tryAgain}>{t('AttemptLockout.TryAgain')}</ThemedText>
              {time && (
                <ThemedText variant="bold" style={styles.countDown}>
                  {time?.hours} {t('AttemptLockout.Hours')} {time?.minutes} {t('AttemptLockout.Minutes')}{' '}
                  {time?.seconds} {t('AttemptLockout.Seconds')}
                </ThemedText>
              )}
            </View>
          )}
        </View>
        <InfoTextBox style={{ flexShrink: 1, padding: Spacing.md }}>
          <View style={{ flex: 1 }}>
            <ThemedText variant="bold" style={{ marginBottom: Spacing.md }}>
              {t('AttemptLockout.ForgotPIN')}
            </ThemedText>
            <ThemedText>{t('AttemptLockout.ForgotPINDescription')}</ThemedText>
          </View>
        </InfoTextBox>
      </ScrollView>
    </SafeAreaView>
  )
}

export default AttemptLockout
