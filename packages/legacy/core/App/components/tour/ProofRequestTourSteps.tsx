import * as React from 'react'
import { useTranslation } from 'react-i18next'
import { Text } from 'react-native'

import { useTheme } from '../../contexts/theme'
import { RenderProps, TourStep } from '../../contexts/tour/tour-context'

import { TourBox } from './TourBox'
import useHandleStop from '../../hooks/close-modal-tour'
import { DispatchAction } from '../../contexts/reducers/store'

export const proofRequestTourSteps: TourStep[] = [
  {
    Render: (props: RenderProps) => {
      const { currentTour, currentStep, next, stop, previous } = props
      const { t } = useTranslation()
      const { ColorPallet, TextTheme } = useTheme()
      const handleStop = useHandleStop()

      return (
        <TourBox
          title={t('Tour.ProofRequests')}
          hideLeft
          rightText={t('Tour.Done')}
          onRight={() => handleStop(stop, DispatchAction.UPDATE_SEEN_PROOF_REQUEST_TOUR)}
          currentTour={currentTour}
          currentStep={currentStep}
          previous={previous}
          stop={() => handleStop(stop, DispatchAction.UPDATE_SEEN_PROOF_REQUEST_TOUR)}
          next={next}
        >
          <Text
            style={{
              ...TextTheme.normal,
              color: ColorPallet.notification.infoText,
            }}
            allowFontScaling={false}
          >
            {t('Tour.ProofRequestsDescription')}
          </Text>
        </TourBox>
      )
    },
  },
]
