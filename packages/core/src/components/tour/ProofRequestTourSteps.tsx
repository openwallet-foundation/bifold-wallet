import * as React from 'react'
import { useTranslation } from 'react-i18next'
import { Text } from 'react-native'

import { useTheme } from '../../contexts/theme'
import { RenderProps, TourStep } from '../../contexts/tour/tour-context'

import { TourBox } from './TourBox'

export const proofRequestTourSteps: TourStep[] = [
  {
    Render: (props: RenderProps) => {
      const { currentTour, currentStep, next, stop, previous } = props
      const { t } = useTranslation()
      const { ColorPallet, TextTheme } = useTheme()
      return (
        <TourBox
          title={t('Tour.ProofRequests')}
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
            {t('Tour.ProofRequestsDescription')}
          </Text>
        </TourBox>
      )
    },
  },
]
