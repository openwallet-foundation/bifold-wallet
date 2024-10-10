import { useAgent } from '@credo-ts/react-hooks'
import React, { PropsWithChildren, useCallback, useEffect, useRef } from 'react'
import { AppState, PanResponder, View } from 'react-native'
import { useAuth } from '../../contexts/auth'
import { useStore } from '../../contexts/store'
import { DispatchAction } from '../../contexts/reducers/store'
import { TOKENS, useServices } from '../../container-api'

export const LockOutTime = {
  OneMinute: 1,
  ThreeMinutes: 3,
  FiveMinutes: 5,
  Never: 0,
} as const

type InactivityWrapperProps = {
  timeoutLength?: number // number of minutes before timeoutAction is triggered, a value of 0 will never trigger the timeoutAction and an undefined value will default to 5 minutes
}

const InactivityWrapper: React.FC<PropsWithChildren<InactivityWrapperProps>> = ({ children, timeoutLength }) => {
  const [logger] = useServices([TOKENS.UTIL_LOGGER])
  const [_, dispatch] = useStore()
  const { agent } = useAgent()
  const { removeSavedWalletSecret } = useAuth()
  const timeoutAsMilliseconds = (timeoutLength !== undefined ? timeoutLength : LockOutTime.OneMinute) * 60000
  const inactivityTimer = useRef<NodeJS.Timeout | null>(null)
  const panResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponderCapture: () => {
        // some user interaction detected, reset timeout
        resetInactivityTimeout(timeoutAsMilliseconds)

        // returns false so the PanResponder doesn't consume the touch event
        return false
      },
    })
  ).current

  const lockUserOut = useCallback(async () => {
    try {
      removeSavedWalletSecret()
      await agent?.wallet.close()
    } catch (error) {
      logger.error(`Error closing agent wallet, ${error}`)
    }

    dispatch({
      type: DispatchAction.DID_AUTHENTICATE,
      payload: [{ didAuthenticate: false }],
    })

    dispatch({
      type: DispatchAction.LOCKOUT_UPDATED,
      payload: [{ displayNotification: true }],
    })
  }, [agent, removeSavedWalletSecret, dispatch, logger])

  const clearTimer = useCallback(() => {
    if (inactivityTimer.current) {
      clearTimeout(inactivityTimer.current)
    }
  }, [])

  const resetInactivityTimeout = useCallback(
    (milliseconds: number) => {
      // remove existing timeout
      clearTimer()

      // do not start timer if timeout is set to 0
      if (milliseconds > 0) {
        // create new timeout
        inactivityTimer.current = setTimeout(async () => {
          lockUserOut()
        }, milliseconds)
      }
    },
    [clearTimer, lockUserOut]
  )

  useEffect(() => {
    // Setup listener for app state changes (background/ foreground movement)
    const eventSubscription = AppState.addEventListener('change', (nextAppState) => {
      if (AppState.currentState === 'active' && ['inactive', 'background'].includes(nextAppState)) {
        if (nextAppState === 'inactive') {
          // special case for iOS devices when a prompt is shown
          return
        }

        // remove timer
        clearTimer()
      }

      if (AppState.currentState === 'active' && ['active'].includes(nextAppState)) {
        if (nextAppState === 'inactive') {
          // special case for iOS devices when a prompt is shown
          return
        }

        // app coming into the foreground is 'user activity', restart timer
        resetInactivityTimeout(timeoutAsMilliseconds)
      }
    })

    // initiate inactivity timer
    resetInactivityTimeout(timeoutAsMilliseconds)

    return () => {
      clearTimer()
      eventSubscription.remove()
    }
  }, [])

  return (
    <View style={{ flex: 1 }} {...panResponder.panHandlers}>
      {children}
    </View>
  )
}
export default InactivityWrapper
