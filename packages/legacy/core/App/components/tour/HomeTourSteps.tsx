import * as React from 'react'
import { useTranslation } from 'react-i18next'
import { Text } from 'react-native'

import { useTheme } from '../../contexts/theme'
import { RenderProps, TourStep } from '../../contexts/tour/tour-context'

import { TourBox } from './TourBox'
import useHandleStop from '../../hooks/close-modal-tour'
import { DispatchAction } from '../../contexts/reducers/store'

export const homeTourSteps: TourStep[] = [
  {
    Render: (props: RenderProps) => {
      const { currentTour, currentStep, next, stop, previous } = props
      const { t } = useTranslation()
      const { ColorPallet, TextTheme } = useTheme()
      const handleStop = useHandleStop()

      return (
        <TourBox
          title={t('Tour.AddAndShare')}
          leftText={t('Tour.Skip')}
          rightText={t('Tour.Next')}
          onLeft={() => handleStop(stop, DispatchAction.UPDATE_SEEN_HOME_TOUR)}
          onRight={next}
          currentTour={currentTour}
          currentStep={currentStep}
          previous={previous}
          stop={() => handleStop(stop, DispatchAction.UPDATE_SEEN_HOME_TOUR)}
          next={next}
        >
          <Text
            style={{
              ...TextTheme.normal,
              color: ColorPallet.notification.infoText,
            }}
            allowFontScaling={false}
          >
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
      const { ColorPallet, TextTheme } = useTheme()
      const handleStop = useHandleStop()

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
          stop={() => handleStop(stop, DispatchAction.UPDATE_SEEN_HOME_TOUR)}
          previous={previous}
        >
          <Text
            style={{
              ...TextTheme.normal,
              color: ColorPallet.notification.infoText,
            }}
            allowFontScaling={false}
          >
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
      const { ColorPallet, TextTheme } = useTheme()
      const handleStop = useHandleStop()

      return (
        <TourBox
          title={t('Tour.YourCredentials')}
          leftText={t('Tour.Back')}
          rightText={t('Tour.Done')}
          onLeft={previous}
          onRight={() => handleStop(stop, DispatchAction.UPDATE_SEEN_HOME_TOUR)}
          currentTour={currentTour}
          currentStep={currentStep}
          next={next}
          stop={() => handleStop(stop, DispatchAction.UPDATE_SEEN_HOME_TOUR)}
          previous={previous}
        >
          <Text
            style={{
              ...TextTheme.normal,
              color: ColorPallet.notification.infoText,
            }}
            allowFontScaling={false}
          >
            {t('Tour.YourCredentialsDescription')}
          </Text>
        </TourBox>
      )
    },
  },
]
