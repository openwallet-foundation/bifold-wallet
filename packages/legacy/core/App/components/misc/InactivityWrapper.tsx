import React, { PropsWithChildren, useEffect, useRef, useState } from 'react'
import { AppState, PanResponder, View } from 'react-native'

export enum LockOutTime {
  OneMinute = 1,
  ThreeMinutes = 3,
  FiveMinutes = 5,
  Never = 0,
}

interface InactivityWrapperProps {
  timeoutLength?: LockOutTime // number of minutes before timeoutAction is triggered, a value of 0 will never trigger the timeoutAction and an undefined value will default to 5 minutes
  timeoutAction: () => void
}

const InactivityWrapper: React.FC<PropsWithChildren<InactivityWrapperProps>> = ({
  children,
  timeoutAction,
  timeoutLength,
}) => {
  const timeout_minutes = timeoutLength !== undefined ? timeoutLength : LockOutTime.FiveMinutes
  const inactivityTimer = useRef<NodeJS.Timeout | null>(null)
  const panResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponderCapture: () => {
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
      console.log("Haven't timed out yet, reset")
      inactivityTimer.current = setTimeout(() => {
        console.log('Time out, log user out')
        timeoutAction()
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
    <View style={{ borderWidth: 1, borderColor: 'green' }} {...panResponder.panHandlers}>
      {children}
    </View>
  )
}
export default InactivityWrapper
