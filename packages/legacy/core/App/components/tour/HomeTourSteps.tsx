import * as React from 'react'
import { useTranslation } from 'react-i18next'
import { Text } from 'react-native'

import { useTheme } from '../../contexts/theme'
import { TourStep } from '../../contexts/tour/tour-context'

import { TourBox } from './TourBox'

export const homeTourSteps: TourStep[] = [
  {
    render: (props) => {
      const { current, next, stop, previous } = props
      const { t } = useTranslation()
      const { ColorPallet, TextTheme } = useTheme()
      return (
        <TourBox
          title={t('Tour.AddAndShare')}
          leftText={t('Tour.Skip')}
          rightText={t('Tour.Next')}
          onLeft={stop}
          onRight={next}
          current={current}
          previous={previous}
          stop={stop}
          next={next}
        >
          <Text
            style={{
              ...TextTheme.normal,
              color: ColorPallet.notification.infoText,
            }}
          >
            {t('Tour.AddAndShareDescription')}
          </Text>
        </TourBox>
      )
    },
  },
  {
    render: (props) => {
      const { current, next, stop, previous } = props
      const { t } = useTranslation()
      const { ColorPallet, TextTheme } = useTheme()
      return (
        <TourBox
          title={t('Tour.Notifications')}
          leftText={t('Tour.Back')}
          rightText={t('Tour.Next')}
          onLeft={previous}
          onRight={next}
          current={current}
          next={next}
          stop={stop}
          previous={previous}
        >
          <Text
            style={{
              ...TextTheme.normal,
              color: ColorPallet.notification.infoText,
            }}
          >
            {t('Tour.NotificationsDescription')}
          </Text>
        </TourBox>
      )
    },
  },
  {
    render: (props) => {
      const { current, next, stop, previous } = props
      const { t } = useTranslation()
      const { ColorPallet, TextTheme } = useTheme()
      return (
        <TourBox
          title={t('Tour.YourCredentials')}
          leftText={t('Tour.Back')}
          rightText={t('Tour.Done')}
          onLeft={previous}
          onRight={stop}
          current={current}
          next={next}
          stop={stop}
          previous={previous}
        >
          <Text
            style={{
              ...TextTheme.normal,
              color: ColorPallet.notification.infoText,
            }}
          >
            {t('Tour.YourCredentialsDescription')}
          </Text>
        </TourBox>
      )
    },
  },
]
