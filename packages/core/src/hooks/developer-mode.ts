import { useRef, useCallback } from 'react'
import { useNavigation } from '@react-navigation/native'
import { useStore } from '../contexts/store'
import { DispatchAction } from '../contexts/reducers/store'
import { Screens } from '../types/navigators'

const TOUCH_COUNT_TO_ENABLE_DEVELOPER_MODE = 10

export const useDeveloperMode = () => {
  const developerOptionCount = useRef(0)
  const [, dispatch] = useStore()
  const { navigate } = useNavigation()

  const incrementDeveloperMenuCounter = useCallback(() => {
    if (developerOptionCount.current >= TOUCH_COUNT_TO_ENABLE_DEVELOPER_MODE) {
      developerOptionCount.current = 0
      dispatch({
        type: DispatchAction.ENABLE_DEVELOPER_MODE,
        payload: [true],
      })
      navigate(Screens.Developer as never)
      return
    } else developerOptionCount.current = developerOptionCount.current + 1
  }, [dispatch, navigate])

  return { incrementDeveloperMenuCounter }
}
