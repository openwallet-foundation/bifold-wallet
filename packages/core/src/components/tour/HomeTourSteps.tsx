import * as React from 'react'
import { useTranslation } from 'react-i18next'
import { Text } from 'react-native'

import { useTheme } from '../../contexts/theme'
import { RenderProps, TourStep } from '../../contexts/tour/tour-context'

import { TourBox } from './TourBox'

export const homeTourSteps: TourStep[] = [
  {
    Render: (props: RenderProps) => {
      const { currentTour, currentStep, next, stop, previous } = props
      const { t } = useTranslation()
      const { ColorPalette, TextTheme } = useTheme()
      return (
        <TourBox
          title={t('Tour.AddAndShare')}
          leftText={t('Tour.Skip')}
          rightText={t('Tour.Next')}
          onLeft={stop}
          onRight={next}
          currentTour={currentTour}
          currentStep={currentStep}
          previous={previous}
          stop={stop}
          next={next}
        >
          <Text
            style={{
              ...TextTheme.normal,
              color: ColorPalette.notification.infoText,
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
      const { ColorPalette, TextTheme } = useTheme()
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
          stop={stop}
          previous={previous}
        >
          <Text
            style={{
              ...TextTheme.normal,
              color: ColorPalette.notification.infoText,
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
      const { ColorPalette, TextTheme } = useTheme()
      return (
        <TourBox
          title={t('Tour.YourCredentials')}
          leftText={t('Tour.Back')}
          rightText={t('Tour.Done')}
          onLeft={previous}
          onRight={stop}
          currentTour={currentTour}
          currentStep={currentStep}
          next={next}
          stop={stop}
          previous={previous}
        >
          <Text
            style={{
              ...TextTheme.normal,
              color: ColorPalette.notification.infoText,
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
