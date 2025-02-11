import { useTranslation } from 'react-i18next'
import { useTheme } from '../contexts/theme'
import { useStore } from '../contexts/store'
import { useCallback } from 'react'
import { DispatchAction } from '../contexts/reducers/store'

const useCommonTourHooks = (stop: () => void, type: DispatchAction) => {
  const { t } = useTranslation()
  const [, dispatch] = useStore()
  const { ColorPallet, TextTheme } = useTheme()

  const endTour = useCallback(() => {
    stop()
    dispatch({
      type: type,
      payload: [true],
    })
  }, [dispatch, stop, type])

  return { t, ColorPallet, TextTheme, endTour }
}

export default useCommonTourHooks
