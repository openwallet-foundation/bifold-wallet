import * as React from 'react'
import { useTranslation } from 'react-i18next'
import { Text } from 'react-native'

import { useTheme } from '../../contexts/theme'
import { RenderProps, TourStep } from '../../contexts/tour/tour-context'

import { TourBox } from './TourBox'
import { useStore } from '../../contexts/store'
import { DispatchAction } from '../../contexts/reducers/store'

export const proofRequestTourSteps: TourStep[] = [
  {
    Render: (props: RenderProps) => {
      const { currentTour, currentStep, next, stop, previous } = props
      const { t } = useTranslation()
      const { ColorPallet, TextTheme } = useTheme()
      const [, dispatch] = useStore()
      const handleStop = (): void => {
        stop()
        dispatch({
          type: DispatchAction.UPDATE_SEEN_PROOF_REQUEST_TOUR,
          payload: [true],
        })
      }

      return (
        <TourBox
          title={t('Tour.ProofRequests')}
          hideLeft
          rightText={t('Tour.Done')}
          onRight={handleStop}
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
            {t('Tour.ProofRequestsDescription')}
          </Text>
        </TourBox>
      )
    },
  },
]
