import * as React from 'react'
import { useTranslation } from 'react-i18next'
import { Text } from 'react-native'

import { useTheme } from '../../contexts/theme'
import { TourStep } from '../../contexts/tour/tour-context'

import { TourBox } from './TourBox'

export const credentialOfferTourSteps: TourStep[] = [
  {
    render: (props) => {
      const { currentTour, currentStep, next, stop, previous } = props
      const { t } = useTranslation()
      const { ColorPallet, TextTheme } = useTheme()
      return (
        <TourBox
          title={t('Tour.CredentialOffers')}
          hideLeft
          rightText={t('Tour.Done')}
          onRight={stop}
          currentTour={currentTour}
          currentStep={currentStep}
          previous={previous}
          stop={stop}
          next={next}
        >
          <Text
            style={{
              ...TextTheme.normal,
              color: ColorPallet.notification.infoText,
            }}
            allowFontScaling={false}
          >
            {t('Tour.CredentialOffersDescription')}
          </Text>
        </TourBox>
      )
    },
  },
]
