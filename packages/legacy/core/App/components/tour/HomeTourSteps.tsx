import * as React from 'react'
import { Text } from 'react-native'
import { RenderProps, TourStep } from '../../contexts/tour/tour-context'
import { TourBox } from './TourBox'
import useCommonTourHooks from '../../hooks/modal-tour-props'
import { DispatchAction } from '../../contexts/reducers/store'
import { IColorPallet, ITextTheme } from '../../theme'

const renderTextContent = (content: string, TextTheme: ITextTheme, ColorPallet: IColorPallet) => (
  <Text
    style={{
      ...TextTheme.normal,
      color: ColorPallet.notification.infoText,
    }}
    allowFontScaling={false}
  >
    {content}
  </Text>
)

export const homeTourSteps: TourStep[] = [
  {
    Render: (props: RenderProps) => {
      const { currentTour, currentStep, next, stop, previous } = props
      const { t, ColorPallet, TextTheme, closeModalTour } = useCommonTourHooks()

      return (
        <TourBox
          title={t('Tour.AddAndShare')}
          leftText={t('Tour.Skip')}
          rightText={t('Tour.Next')}
          onLeft={() => closeModalTour(stop, DispatchAction.UPDATE_SEEN_HOME_TOUR)}
          onRight={next}
          currentTour={currentTour}
          currentStep={currentStep}
          previous={previous}
          stop={() => closeModalTour(stop, DispatchAction.UPDATE_SEEN_HOME_TOUR)}
          next={next}
        >
          {renderTextContent(t('Tour.AddAndShareDescription'), TextTheme, ColorPallet)}
        </TourBox>
      )
    },
  },
  {
    Render: (props: RenderProps) => {
      const { currentTour, currentStep, next, stop, previous } = props
      const { t, ColorPallet, TextTheme, closeModalTour } = useCommonTourHooks()

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
          stop={() => closeModalTour(stop, DispatchAction.UPDATE_SEEN_HOME_TOUR)}
          previous={previous}
        >
          {renderTextContent(t('Tour.NotificationsDescription'), TextTheme, ColorPallet)}
        </TourBox>
      )
    },
  },
  {
    Render: (props: RenderProps) => {
      const { currentTour, currentStep, next, stop, previous } = props
      const { t, ColorPallet, TextTheme, closeModalTour } = useCommonTourHooks()

      return (
        <TourBox
          title={t('Tour.YourCredentials')}
          leftText={t('Tour.Back')}
          rightText={t('Tour.Done')}
          onLeft={previous}
          onRight={() => closeModalTour(stop, DispatchAction.UPDATE_SEEN_HOME_TOUR)}
          currentTour={currentTour}
          currentStep={currentStep}
          next={next}
          stop={() => closeModalTour(stop, DispatchAction.UPDATE_SEEN_HOME_TOUR)}
          previous={previous}
        >
          {renderTextContent(t('Tour.YourCredentialsDescription'), TextTheme, ColorPallet)}
        </TourBox>
      )
    },
  },
]
