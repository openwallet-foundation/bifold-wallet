import * as React from 'react'

import { Text } from 'react-native'
import { RenderProps, TourStep } from '../../contexts/tour/tour-context'

import { TourBox } from './TourBox'
import useCommonTourHooks from '../../hooks/modal-tour-props'
import { DispatchAction } from '../../contexts/reducers/store'

export const credentialOfferTourSteps: TourStep[] = [
  {
    Render: (props: RenderProps) => {
      const { currentTour, currentStep, next, stop, previous } = props
      const { t, ColorPallet, TextTheme, closeModalTour } = useCommonTourHooks()

      return (
        <TourBox
          title={t('Tour.CredentialOffers')}
          hideLeft
          rightText={t('Tour.Done')}
          onRight={() => closeModalTour(stop, DispatchAction.UPDATE_SEEN_CREDENTIAL_OFFER_TOUR)}
          currentTour={currentTour}
          currentStep={currentStep}
          previous={previous}
          stop={() => closeModalTour(stop, DispatchAction.UPDATE_SEEN_CREDENTIAL_OFFER_TOUR)}
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
