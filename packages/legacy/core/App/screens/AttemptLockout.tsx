import { useNavigation } from '@react-navigation/core'
import { CommonActions } from '@react-navigation/native'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import Button, { ButtonType } from '../components/buttons/Button'
import { second, minute, hour } from '../constants'
import { DispatchAction } from '../contexts/reducers/store'
import { useStore } from '../contexts/store'
import { useTheme } from '../contexts/theme'
import { Screens } from '../types/navigators'
import { testIdWithKey } from '../utils/testable'

interface Timer {
  hours: number
  minutes: number
  seconds: number
}

const AttemptLockout: React.FC = () => {
  const { ColorPallet, TextTheme, Assets } = useTheme()
  const { t } = useTranslation()
  const [state, dispatch] = useStore()
  const [time, setTime] = useState<Timer>()
  const [timeoutDone, setTimeoutDone] = useState<boolean>(false)
  const navigation = useNavigation()
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      backgroundColor: ColorPallet.brand.primaryBackground,
    },
    title: {
      ...TextTheme.headingThree,
      marginHorizontal: 50,
      textAlign: 'center',
      marginBottom: 50,
    },
    description: {
      ...TextTheme.normal,
      textAlign: 'center',
      marginHorizontal: 50,
      marginBottom: 50,
    },
    tryAgain: {
      ...TextTheme.normal,
      textAlign: 'center',
    },
    countDown: {
      ...TextTheme.normal,
      textAlign: 'center',
      fontWeight: 'bold',
    },
    image: {
      width: 150,
      height: 150,
      marginBottom: 20,
      marginTop: 25,
    },
  })

  // update the countdown timer. Return true if the lockout penalty time is over
  const updateTimeRemaining = (): boolean => {
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
  }

  // run once immediately at screen initialization
  useEffect(() => {
    setTimeoutDone(updateTimeRemaining())
  }, [])

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

  const unlock = async () => {
    dispatch({
      type: DispatchAction.ATTEMPT_UPDATED,
      payload: [{ loginAttempts: state.loginAttempt.loginAttempts, lockoutDate: undefined, servedPenalty: true }],
    })
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: Screens.EnterPIN }],
      })
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <Assets.svg.appLockout style={styles.image} />
      <View>
        <Text style={styles.title}>{t('AttemptLockout.Title')}</Text>
        <Text style={styles.description}>{t('AttemptLockout.Description')}</Text>
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
            <Text style={styles.tryAgain}>{t('AttemptLockout.TryAgain')}</Text>
            {time && (
              <Text style={styles.countDown}>
                {time?.hours} {t('AttemptLockout.Hours')} {time?.minutes} {t('AttemptLockout.Minutes')} {time?.seconds}{' '}
                {t('AttemptLockout.Seconds')}
              </Text>
            )}
          </View>
        )}
      </View>
    </SafeAreaView>
  )
}

export default AttemptLockout
