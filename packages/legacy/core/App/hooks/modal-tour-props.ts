import { useTranslation } from 'react-i18next'
import { useTheme } from '../contexts/theme'
import useCloseModalTour from '../hooks/close-modal-tour'

const useCommonTourHooks = () => {
  const { t } = useTranslation()
  const { ColorPallet, TextTheme } = useTheme()
  const closeModalTour = useCloseModalTour()

  return { t, ColorPallet, TextTheme, closeModalTour }
}

export default useCommonTourHooks
