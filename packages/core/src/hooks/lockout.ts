import { useCallback } from 'react'
import { useNavigation, CommonActions } from '@react-navigation/native'
import { useStore } from '../contexts/store'
import { DispatchAction } from '../contexts/reducers/store'
import { Screens } from '../types/navigators'
import { TOKENS, useServices } from '../container-api'
import { attemptLockoutConfig } from '../constants'

export const useAttemptLockout = () => {
  const [store, dispatch] = useStore()
  const navigation = useNavigation()
  // set the attempt lockout time
  return useCallback(
    async (penalty: number) => {
      dispatch({
        type: DispatchAction.ATTEMPT_UPDATED,
        payload: [
          {
            loginAttempts: store.loginAttempt.loginAttempts + 1,
            lockoutDate: Date.now() + penalty,
            servedPenalty: false,
          },
        ],
      })
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: Screens.AttemptLockout }],
        })
      )
    },
    [store, dispatch, navigation]
  )
}

export const useGetLockoutPenalty = () => {
  const [{ attemptLockoutConfig: { baseRules, thresholdRules } = attemptLockoutConfig }] = useServices([TOKENS.CONFIG])
  return useCallback(
    (attempts: number) => {
      let penalty = baseRules[attempts]
      if (!penalty && attempts >= thresholdRules.threshold && !(attempts % thresholdRules.increment)) {
        penalty = thresholdRules.thresholdPenaltyDuration
      }
      return penalty
    },
    [baseRules, thresholdRules]
  )
}

// This method is used to notify the app that the user is able to receive
// another lockout penalty
export const useUnMarkServedPenalty = () => {
  const [store, dispatch] = useStore()
  return useCallback(() => {
    dispatch({
      type: DispatchAction.ATTEMPT_UPDATED,
      payload: [
        {
          loginAttempts: store.loginAttempt.loginAttempts,
          lockoutDate: undefined,
          servedPenalty: undefined,
        },
      ],
    })
  }, [dispatch, store.loginAttempt.loginAttempts])
}

export const useLockout = () => {
  const getLockoutPenalty = useGetLockoutPenalty()
  const attemptLockout = useAttemptLockout()
  const unMarkServedPenalty = useUnMarkServedPenalty()
  return {
    getLockoutPenalty,
    attemptLockout,
    unMarkServedPenalty,
  }
}
