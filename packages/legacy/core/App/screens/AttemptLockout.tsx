import React, { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ScrollView, StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import Button, { ButtonType } from '../components/buttons/Button'
import { second, minute, hour } from '../constants'
import { DispatchAction } from '../contexts/reducers/store'
import { useStore } from '../contexts/store'
import { useTheme } from '../contexts/theme'
import { testIdWithKey } from '../utils/testable'
import { ThemedText } from '../components/texts/ThemedText'
import InfoTextBox from '../components/texts/InfoTextBox'

interface Timer {
  hours: number
  minutes: number
  seconds: number
}

const AttemptLockout: React.FC = () => {
  const { ColorPallet, Assets, Spacing } = useTheme()
  const { t } = useTranslation()
  const [state, dispatch] = useStore()
  const [time, setTime] = useState<Timer>()
  const [timeoutDone, setTimeoutDone] = useState<boolean>(false)
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: ColorPallet.brand.primaryBackground,
      paddingHorizontal: Spacing.lg,
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

  // update the countdown timer. Return true if the lockout penalty time is over
  const updateTimeRemaining = useCallback((): boolean => {
    let penaltyServed = true
    const penalty = state.loginAttempt.lockoutDate
    const currDate = Date.now()
    if (penalty) {
      let diff = penalty - currDate
      if (diff > 0) {
        penaltyServed = false
        const hoursLeft = Math.floor(diff / hour)
        diff = diff - hoursLeft * hour

        const minutesLeft = Math.floor(diff / minute)
        diff = diff - minutesLeft * minute

        const secondsLeft = Math.floor(diff / second)
        const timer: Timer = {
          hours: hoursLeft,
          minutes: minutesLeft,
          seconds: secondsLeft,
        }

        setTime(timer)
      }
    }

    return penaltyServed
  }, [state.loginAttempt.lockoutDate])

  // run once immediately at screen initialization
  useEffect(() => {
    setTimeoutDone(updateTimeRemaining())
  }, [updateTimeRemaining])

  // make sure set timeout only runs once
  useEffect(() => {
    const updateTimer = setTimeout(() => {
      // calculate time remaining
      const timerDone = updateTimeRemaining()
      setTimeoutDone(timerDone)
      if (timerDone) {
        clearInterval(updateTimer)
      }
    }, 1000)
  })

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
