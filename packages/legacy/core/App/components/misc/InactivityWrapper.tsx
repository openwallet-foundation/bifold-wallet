import React, { PropsWithChildren, useEffect, useRef } from 'react'
import { PanResponder, View } from 'react-native'

export enum LockOutTime {
  OneMinute = 1,
  ThreeMinutes = 3,
  FiveMinutes = 5,
  Never = 0,
}

interface InactivityWrapperProps {
  timeoutLength?: LockOutTime // number of minutes before timeoutAction is triggered, a value of 0 will never trigger the timeoutAction
  timeoutAction: () => void
}

const InactivityWrapper: React.FC<PropsWithChildren<InactivityWrapperProps>> = ({
  children,
  timeoutAction,
  timeoutLength,
}) => {
  const timeout_minutes = timeoutLength !== undefined ? timeoutLength : 5
  const inactivityTimer = useRef<NodeJS.Timeout | null>(null)
  const panResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponderCapture: () => {
        console.log('Responder is responding')
        // some user iteraction, reset timeout
        resetInactivityTimeout()
        return false
      },
    })
  ).current

  const resetInactivityTimeout = () => {
    // remove existing timeout
    if (inactivityTimer.current) {
      clearTimeout(inactivityTimer.current)
    }

    // do not start timer if timeout is set to 0
    if (timeout_minutes > 0) {
      // create new timeout
      inactivityTimer.current = setTimeout(() => {
        console.log('Time out, log user out')
        timeoutAction()
      }, timeout_minutes * 60000) // convert minutes to miliseconds
    }
  }

  useEffect(() => {
    // initiate inactivity timer
    resetInactivityTimeout()
  }, [])
  return (
    <View style={{ borderWidth: 1, borderColor: 'green' }} {...panResponder.panHandlers}>
      {children}
    </View>
  )
}
export default InactivityWrapper
