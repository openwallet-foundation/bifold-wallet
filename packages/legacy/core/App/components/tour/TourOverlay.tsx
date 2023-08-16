import React, { useCallback, useContext, useRef, useState, useEffect } from 'react'
import { ColorValue, LayoutRectangle, Modal, View, ViewStyle, useWindowDimensions } from 'react-native'
import { Defs, Mask, Rect, Svg } from 'react-native-svg'

import { tourMargin } from '../../constants'
import { BackdropPressBehavior, OSConfig, TourContext, TourStep } from '../../contexts/tour/tour-context'
import { Optional, TourID } from '../../types/tour'
import { testIdWithKey } from '../../utils/testable'

import { SpotCutout } from './SpotCutout'

interface TourOverlayProps {
  backdropOpacity: number
  color: ColorValue
  currentTour: TourID
  currentStep: Optional<number>
  nativeDriver: boolean | OSConfig<boolean>
  onBackdropPress: Optional<BackdropPressBehavior>
  changeSpot: (spot: LayoutRectangle) => void
  spot: LayoutRectangle
  tourStep: TourStep
}

export const TourOverlay = (props: TourOverlayProps) => {
  const { width: windowWidth, height: windowHeight } = useWindowDimensions()
  const { color, currentTour, currentStep, onBackdropPress, backdropOpacity, changeSpot, spot, tourStep } = props

  const { next, previous, start, stop } = useContext(TourContext)

  const [tooltipStyle, setTooltipStyle] = useState<ViewStyle>({})

  const tooltipRef = useRef<View>(null)

  const handleBackdropPress = useCallback((): void => {
    const handler = tourStep.onBackdropPress ?? onBackdropPress

    if (handler !== undefined && currentStep !== undefined) {
      switch (handler) {
        case 'continue':
          return next()

        case 'stop':
          return stop()

        default:
          return handler({ currentTour, currentStep, changeSpot, next, previous, start, stop })
      }
    }
  }, [tourStep, onBackdropPress, currentTour, currentStep, changeSpot, next, previous, start, stop])

  useEffect(() => {
    const gapBetweenSpotAndTooltip = 50
    // if origin spot (ie. no spotlight)
    if (spot.x === 0 && spot.y === 0) {
      const top = windowHeight / 5
      setTooltipStyle({
        left: tourMargin,
        right: tourMargin,
        top,
      })
      // if spot is in the lower half of the screen
    } else if (spot.y >= windowHeight / 2) {
      const bottom = windowHeight - spot.y + gapBetweenSpotAndTooltip
      setTooltipStyle({
        left: tourMargin,
        right: tourMargin,
        bottom,
      })
      // if spot is in the upper half of the screen
    } else {
      const top = spot.y + gapBetweenSpotAndTooltip + spot.height
      setTooltipStyle({
        left: tourMargin,
        right: tourMargin,
        top,
      })
    }
  }, [spot.height, spot.width, spot.x, spot.y])

  return (
    <Modal
      animationType="fade"
      presentationStyle="overFullScreen"
      transparent={true}
      visible={currentStep !== undefined}
    >
      <View style={{ height: windowHeight, width: windowWidth }} testID={testIdWithKey('SpotlightOverlay')}>
        <Svg
          testID={testIdWithKey('SpotOverlay')}
          height="100%"
          width="100%"
          viewBox={`0 0 ${windowWidth} ${windowHeight}`}
          onPress={handleBackdropPress}
          shouldRasterizeIOS={true}
          renderToHardwareTextureAndroid={true}
        >
          <Defs>
            <Mask id="mask" x={0} y={0} height="100%" width="100%">
              <Rect height="100%" width="100%" fill="#fff" />
              <SpotCutout />
            </Mask>
          </Defs>

          <Rect height="100%" width="100%" fill={color} mask="url(#mask)" opacity={backdropOpacity} />
        </Svg>

        <View
          ref={tooltipRef}
          testID={testIdWithKey('SpotTooltip')}
          style={{ ...tooltipStyle, opacity: 1, position: 'absolute' }}
        >
          {currentStep !== undefined && (
            <tourStep.render
              currentTour={currentTour}
              currentStep={currentStep}
              changeSpot={changeSpot}
              next={next}
              previous={previous}
              stop={stop}
            />
          )}
        </View>
      </View>
    </Modal>
  )
}
