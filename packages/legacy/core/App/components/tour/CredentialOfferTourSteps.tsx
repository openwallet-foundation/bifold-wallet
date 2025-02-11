import * as React from 'react'

import { Text } from 'react-native'
import { RenderProps, TourStep } from '../../contexts/tour/tour-context'

import { TourBox } from './TourBox'
import useCommonTourHooks from '../../hooks/common-tour'
import { DispatchAction } from '../../contexts/reducers/store'

export const credentialOfferTourSteps: TourStep[] = [
  {
    Render: (props: RenderProps) => {
      const { currentTour, currentStep, next, stop, previous } = props
      const { t, ColorPallet, TextTheme, endTour } = useCommonTourHooks(
        stop,
        DispatchAction.UPDATE_SEEN_CREDENTIAL_OFFER_TOUR
      )

      return (
        <TourBox
          title={t('Tour.CredentialOffers')}
          hideLeft
          rightText={t('Tour.Done')}
          onRight={endTour}
          currentTour={currentTour}
          currentStep={currentStep}
          previous={previous}
          stop={endTour}
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
