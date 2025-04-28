import { useAgent } from '@credo-ts/react-hooks'
import React, {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { AppState, AppStateStatus, PanResponder, View } from 'react-native'
import { useAuth } from './auth'
import { useStore } from './store'
import { DispatchAction } from './reducers/store'
import { TOKENS, useServices } from '../container-api'
import { defaultAutoLockTime } from '../constants'

// number of minutes before the timeout action is triggered
// a value of 0 will never trigger the lock out action and
// an undefined value will default to 5 minutes
export const AutoLockTime = {
  OneMinute: 1,
  ThreeMinutes: 3,
  FiveMinutes: 5,
  Never: 0,
} as const

export interface ActivityContext {
  appStateStatus: AppStateStatus
}

export const ActivityContext = createContext<ActivityContext>(null as unknown as ActivityContext)

export const ActivityProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [logger] = useServices([TOKENS.UTIL_LOGGER])
  const [store, dispatch] = useStore()
  const { agent } = useAgent()
  const { removeSavedWalletSecret } = useAuth()
  const lastActiveTimeRef = useRef<number | undefined>(undefined)
  const timeoutInMilliseconds = useRef<number>((store.preferences.autoLockTime ?? defaultAutoLockTime) * 60000)
  const inactivityTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const prevAppStateStatusRef = useRef(AppState.currentState)
  const [appStateStatus, setAppStateStatus] = useState<AppStateStatus>(AppState.currentState)

  if (!agent) {
    throw new Error('ActivityProvider must be used within agent context provider')
  }

  const lockOutUser = useCallback(() => {
    removeSavedWalletSecret()
    dispatch({
      type: DispatchAction.DID_AUTHENTICATE,
      payload: [false],
    })
    dispatch({
      type: DispatchAction.LOCKOUT_UPDATED,
      payload: [{ displayNotification: true }],
    })
  }, [removeSavedWalletSecret, dispatch])

  const clearInactivityTimeoutIfExists = useCallback(() => {
    if (inactivityTimeoutRef.current) {
      clearTimeout(inactivityTimeoutRef.current)
    }
  }, [])

  const resetInactivityTimeout = useCallback(
    (milliseconds: number) => {
      clearInactivityTimeoutIfExists()
      lastActiveTimeRef.current = Date.now()

      // do not set timeout if timeout duration is set to 0
      if (milliseconds > 0) {
        // create new timeout
        inactivityTimeoutRef.current = setTimeout(lockOutUser, milliseconds)
      }
    },
    [clearInactivityTimeoutIfExists, lockOutUser]
  )

  useEffect(() => {
    // listener for backgrounding / foregrounding
    const eventSubscription = AppState.addEventListener('change', async (nextAppState) => {
      // if going into the background
      if (['active', 'inactive'].includes(prevAppStateStatusRef.current) && nextAppState === 'background') {
        // remove timeout when backgrounded as timeout refs can be lost when app is backgrounded
        clearInactivityTimeoutIfExists()
        try {
          await agent.mediationRecipient.stopMessagePickup()
          logger.info('Stopped agent message pickup')
        } catch (err) {
          logger.error(`Error stopping agent message pickup, ${err}`)
        }
      }

      // if coming to the foreground
      if (prevAppStateStatusRef.current === 'background' && ['active', 'inactive'].includes(nextAppState)) {
        // if app was in background for longer than allowed time, lock out user
        if (
          lastActiveTimeRef.current &&
          Date.now() - lastActiveTimeRef.current >= timeoutInMilliseconds.current &&
          timeoutInMilliseconds.current > 0
        ) {
          lockOutUser()
        } else {
          // otherwise restart message pickup
          try {
            await agent.mediationRecipient.initiateMessagePickup()
            logger.info('Restarted agent message pickup')
          } catch (err) {
            logger.error(`Error restarting agent message pickup, ${err}`)
          }
        }

        // app coming into the foreground is 'user activity', reset timeout
        resetInactivityTimeout(timeoutInMilliseconds.current)
      }

      prevAppStateStatusRef.current = nextAppState
      setAppStateStatus(nextAppState)
    })

    // initial timeout setup
    resetInactivityTimeout(timeoutInMilliseconds.current)

    return () => {
      clearInactivityTimeoutIfExists()
      eventSubscription.remove()
    }
  }, [clearInactivityTimeoutIfExists, lockOutUser, resetInactivityTimeout, agent, logger])

  useEffect(() => {
    // user has updated settings for auto lock time
    timeoutInMilliseconds.current = store.preferences.autoLockTime * 60000
  }, [store.preferences.autoLockTime])

  const panResponder = useMemo(() => {
    return PanResponder.create({
      onStartShouldSetPanResponderCapture: () => {
        // some user interaction detected, reset timeout
        resetInactivityTimeout(timeoutInMilliseconds.current)

        // returns false so the PanResponder doesn't consume the touch event
        return false
      },
    })
  }, [resetInactivityTimeout])

  return (
    <ActivityContext.Provider value={{ appStateStatus }}>
      <View style={{ flex: 1 }} {...panResponder.panHandlers}>
        {children}
      </View>
    </ActivityContext.Provider>
  )
}
export const useActivity = () => useContext(ActivityContext)
