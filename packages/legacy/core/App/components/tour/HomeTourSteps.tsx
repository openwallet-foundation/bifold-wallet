import * as React from 'react'
import { useTranslation } from 'react-i18next'
import { Text, TextStyle } from 'react-native'

import { useTheme } from '../../contexts/theme'
import { RenderProps, TourStep } from '../../contexts/tour/tour-context'

import { TourBox } from './TourBox'
import useCloseModalTour from '../../hooks/close-modal-tour'
import { DispatchAction } from '../../contexts/reducers/store'

const useCommonStyles = () => {
  const { ColorPallet, TextTheme } = useTheme()

  const textStyle: TextStyle = {
    ...TextTheme.normal,
    color: ColorPallet.notification.infoText,
  }

  return { textStyle }
}

export const homeTourSteps: TourStep[] = [
  {
    Render: (props: RenderProps) => {
      const { currentTour, currentStep, next, stop, previous } = props
      const { t } = useTranslation()
      const { textStyle } = useCommonStyles()
      const closeModalTour = useCloseModalTour()

      return (
        <TourBox
          title={t('Tour.AddAndShare')}
          leftText={t('Tour.Skip')}
          rightText={t('Tour.Next')}
          onLeft={() => closeModalTour(stop, DispatchAction.UPDATE_SEEN_HOME_TOUR)}
          onRight={next}
          currentTour={currentTour}
          currentStep={currentStep}
          previous={previous}
          stop={() => closeModalTour(stop, DispatchAction.UPDATE_SEEN_HOME_TOUR)}
          next={next}
        >
          <Text style={textStyle} allowFontScaling={false}>
            {t('Tour.AddAndShareDescription')}
          </Text>
        </TourBox>
      )
    },
  },
  {
    Render: (props: RenderProps) => {
      const { currentTour, currentStep, next, stop, previous } = props
      const { t } = useTranslation()
      const { textStyle } = useCommonStyles()
      const closeModalTour = useCloseModalTour()

      return (
        <TourBox
          title={t('Tour.Notifications')}
          leftText={t('Tour.Back')}
          rightText={t('Tour.Next')}
          onLeft={previous}
          onRight={next}
          currentTour={currentTour}
          currentStep={currentStep}
          next={next}
          stop={() => closeModalTour(stop, DispatchAction.UPDATE_SEEN_HOME_TOUR)}
          previous={previous}
        >
          <Text style={textStyle} allowFontScaling={false}>
            {t('Tour.NotificationsDescription')}
          </Text>
        </TourBox>
      )
    },
  },
  {
    Render: (props: RenderProps) => {
      const { currentTour, currentStep, next, stop, previous } = props
      const { t } = useTranslation()
      const { textStyle } = useCommonStyles()
      const closeModalTour = useCloseModalTour()

      return (
        <TourBox
          title={t('Tour.YourCredentials')}
          leftText={t('Tour.Back')}
          rightText={t('Tour.Done')}
          onLeft={previous}
          onRight={() => closeModalTour(stop, DispatchAction.UPDATE_SEEN_HOME_TOUR)}
          currentTour={currentTour}
          currentStep={currentStep}
          next={next}
          stop={() => closeModalTour(stop, DispatchAction.UPDATE_SEEN_HOME_TOUR)}
          previous={previous}
        >
          <Text style={textStyle} allowFontScaling={false}>
            {t('Tour.YourCredentialsDescription')}
          </Text>
        </TourBox>
      )
    },
  },
]
