import { useCallback, useRef } from 'react'
import { DispatchAction } from '../contexts/reducers/store'
import { useStore } from '../contexts/store'

const TOUCH_COUNT_TO_ENABLE_DEVELOPER_MODE = 10

export const useDeveloperMode = (onDevModeTriggered?: () => void) => {
  const developerOptionCount = useRef(0)
  const [, dispatch] = useStore()

  const incrementDeveloperMenuCounter = useCallback(() => {
    if (developerOptionCount.current >= TOUCH_COUNT_TO_ENABLE_DEVELOPER_MODE) {
      developerOptionCount.current = 0
      dispatch({
        type: DispatchAction.ENABLE_DEVELOPER_MODE,
        payload: [true],
      })
      onDevModeTriggered?.()
    } else {
      developerOptionCount.current = developerOptionCount.current + 1
    }
  }, [dispatch, onDevModeTriggered])

  return { incrementDeveloperMenuCounter }
}
