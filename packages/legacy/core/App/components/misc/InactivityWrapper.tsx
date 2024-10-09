import { useAgent } from '@credo-ts/react-hooks'
import React, { PropsWithChildren, useEffect, useRef } from 'react'
import { AppState, PanResponder, View } from 'react-native'
import { useAuth } from '../../contexts/auth'
import { useStore } from '../../contexts/store'
import { DispatchAction } from '../../contexts/reducers/store'
import { TOKENS, useServices } from '../../container-api'

export enum LockOutTime {
  OneMinute = 1,
  ThreeMinutes = 3,
  FiveMinutes = 1,
  Never = 0,
}

interface InactivityWrapperProps {
  timeoutLength?: LockOutTime // number of minutes before timeoutAction is triggered, a value of 0 will never trigger the timeoutAction and an undefined value will default to 5 minutes
}

const InactivityWrapper: React.FC<PropsWithChildren<InactivityWrapperProps>> = ({ children, timeoutLength }) => {
  const [logger] = useServices([TOKENS.UTIL_LOGGER])
  useStore()
  const [_, dispatch] = useStore()
  const { agent } = useAgent()
  const { removeSavedWalletSecret } = useAuth()
  const timeout_minutes = timeoutLength !== undefined ? timeoutLength : LockOutTime.OneMinute
  const inactivityTimer = useRef<NodeJS.Timeout | null>(null)
  const panResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponderCapture: () => {
        console.log('Pan responder responding')
        // some user interaction, reset timeout
        resetInactivityTimeout(timeout_minutes)

        // returns false so the PanResponder doesn't consume the touch event
        return false
      },
    })
  ).current

  const resetInactivityTimeout = (minutes: number) => {
    // remove existing timeout
    clearTimer()

    // do not start timer if timeout is set to 0
    if (minutes > 0) {
      // create new timeout
      inactivityTimer.current = setTimeout(async () => {
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
      }, minutesToMilliseconds(minutes))
    }
  }

  const clearTimer = () => {
    if (inactivityTimer.current) {
      clearTimeout(inactivityTimer.current)
    }
  }

  const minutesToMilliseconds = (minutes: number) => {
    return minutes * 60000
  }

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
        resetInactivityTimeout(timeout_minutes)
      }
    })

    // initiate inactivity timer
    resetInactivityTimeout(timeout_minutes)

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
