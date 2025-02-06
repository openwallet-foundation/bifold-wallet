import * as React from 'react'
import { useTranslation } from 'react-i18next'
import { Text } from 'react-native'

import { useTheme } from '../../contexts/theme'
import { RenderProps, TourStep } from '../../contexts/tour/tour-context'

import { TourBox } from './TourBox'
import { useStore } from '../../contexts/store'
import { DispatchAction } from '../../contexts/reducers/store'

export const homeTourSteps: TourStep[] = [
  {
    Render: (props: RenderProps) => {
      const { currentTour, currentStep, next, stop, previous } = props
      const { t } = useTranslation()
      const { ColorPallet, TextTheme } = useTheme()
      const [, dispatch] = useStore()
      const handleStop = (): void => {
        stop()
        dispatch({
          type: DispatchAction.UPDATE_SEEN_HOME_TOUR,
          payload: [true],
        })
      }
      return (
        <TourBox
          title={t('Tour.AddAndShare')}
          leftText={t('Tour.Skip')}
          rightText={t('Tour.Next')}
          onLeft={handleStop}
          onRight={next}
          currentTour={currentTour}
          currentStep={currentStep}
          previous={previous}
          stop={handleStop}
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
      const [, dispatch] = useStore()
      const handleStop = (): void => {
        stop()
        dispatch({
          type: DispatchAction.UPDATE_SEEN_HOME_TOUR,
          payload: [true],
        })
      }
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
          stop={handleStop}
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
      const [, dispatch] = useStore()
      const handleStop = (): void => {
        stop()
        dispatch({
          type: DispatchAction.UPDATE_SEEN_HOME_TOUR,
          payload: [true],
        })
      }
      return (
        <TourBox
          title={t('Tour.YourCredentials')}
          leftText={t('Tour.Back')}
          rightText={t('Tour.Done')}
          onLeft={previous}
          onRight={handleStop}
          currentTour={currentTour}
          currentStep={currentStep}
          next={next}
          stop={handleStop}
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
