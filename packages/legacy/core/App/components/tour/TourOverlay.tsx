import React, { useCallback, useContext, useRef, useState, useEffect } from 'react'
import { ColorValue, LayoutRectangle, View, ViewStyle, useWindowDimensions } from 'react-native'
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
  const [viewBox, setViewBox] = useState(`0 0 ${windowWidth} ${windowHeight}`)
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
      // a relative margin so that the tooltip doesn't start at the very top of the screen
      const oneSixthOfScreenHeight = windowHeight / 6
      setTooltipStyle({
        left: tourMargin,
        right: tourMargin,
        top: oneSixthOfScreenHeight,
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
  }, [windowWidth, windowHeight, spot.width, spot.height, spot.x, spot.y])

  useEffect(() => {
    // + 1 pixel to account for an svg size rounding issue that would cause
    // a tiny gap around the overlay
    setViewBox(`0 0 ${windowWidth + 1} ${windowHeight + 1}`)
  }, [windowWidth, windowHeight])

  return currentStep !== undefined ? (
    <View style={{ position: 'absolute', top: 0, left: 0, height: windowHeight + 1, width: windowWidth + 1 }} testID={testIdWithKey('SpotlightOverlay')}>
      <Svg
        testID={testIdWithKey('SpotOverlay')}
        height={windowHeight + 1}
        width={windowWidth + 1}
        viewBox={viewBox}
        onPress={handleBackdropPress}
        shouldRasterizeIOS={true}
        renderToHardwareTextureAndroid={true}
      >
        <Defs>
          <Mask id="mask" x={0} y={0} height={windowHeight + 1} width={windowWidth + 1}>
            <Rect height={windowHeight + 1} width={windowWidth + 1} fill="#fff" />
            <SpotCutout />
          </Mask>
        </Defs>

        <Rect
          height={windowHeight + 1}
          width={windowWidth + 1}
          fill={color}
          mask="url(#mask)"
          opacity={backdropOpacity}
        />
      </Svg>

      <View
        ref={tooltipRef}
        testID={testIdWithKey('SpotTooltip')}
        style={{ ...tooltipStyle, opacity: 1, position: 'absolute' }}
      >
        <tourStep.render
          currentTour={currentTour}
          currentStep={currentStep}
          changeSpot={changeSpot}
          next={next}
          previous={previous}
          stop={stop}
        />
      </View>
    </View>
  ) : null
}
