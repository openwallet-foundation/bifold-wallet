import React, { forwardRef, useCallback, useImperativeHandle, useMemo, useState } from 'react'
import { ColorValue, LayoutRectangle } from 'react-native'

import { TourOverlay } from '../../components/tour/TourOverlay'
import { ChildFn } from '../../types/tour'
import { isChildFunction } from '../../utils/helpers'

import { BackdropPressBehavior, OSConfig, Tour, TourContext, TourCtx, TourStep, ORIGIN_SPOT } from './tour-context'

export interface TourProviderProps {
  children: React.ReactNode | ChildFn<Tour>
  /**
   * Define if the animations in the tour should use the native driver or not.
   * A boolean can be used to apply the same value to both Android and iOS, or
   * an object with `android` and `ios` keys can be used to define a value for
   * each OS.
   *
   * @default false
   */
  nativeDriver?: boolean | OSConfig<boolean>
  /**
   * Sets the default behavior of pressing the tour's backdrop. You can use
   * either one of the following values:
   * - A callback function with the {@link Tour} options object in the
   * first argument. This allows more franular control over the tour.
   * - The `continue` literal string, which is a shortcut to move to the next
   * step, and stop the tour on the last step.
   * - the `stop` literal string, which is a shortcut to stop the tour.
   *
   * **NOTE:** You can also override this behavior on each step configuration.
   */
  onBackdropPress?: BackdropPressBehavior
  /**
   * The color of the overlay of the tour.
   *
   * @default black
   */
  overlayColor?: ColorValue
  /**
   * The opacity applied to the overlay of the tour (between 0 to 1).
   *
   * @default 0.45
   */
  overlayOpacity?: number
  /**
   * An array of `TourStep` objects that define each step of the tour.
   */
  steps: TourStep[]
}

export const TourProvider = forwardRef<Tour, TourProviderProps>((props, ref) => {
  const {
    children,
    onBackdropPress,
    overlayColor = 'black',
    overlayOpacity = 0.45,
    steps,
    nativeDriver = false,
  } = props

  const [current, setCurrent] = useState<number>()
  const [spot, setSpot] = useState(ORIGIN_SPOT)

  const renderStep = useCallback(
    (index: number): void | Promise<void> => {
      const step = steps[index]

      if (step !== undefined) {
        setCurrent(index)
      }
    },
    [steps]
  )

  const changeSpot = useCallback((newSpot: LayoutRectangle): void => {
    setSpot(newSpot)
  }, [])

  const start = useCallback((): void => {
    renderStep(0)
  }, [renderStep])

  const stop = useCallback((): void => {
    setCurrent(undefined)
    setSpot(ORIGIN_SPOT)
  }, [])

  const next = useCallback((): void => {
    if (current !== undefined) {
      current === steps.length - 1 ? stop() : renderStep(current + 1)
    }
  }, [stop, renderStep, current, steps.length])

  const previous = useCallback((): void => {
    if (current !== undefined && current > 0) {
      renderStep(current - 1)
    }
  }, [renderStep, current])

  const goTo = useCallback(
    (index: number): void => {
      renderStep(index)
    },
    [renderStep]
  )

  const currentStep = useMemo((): TourStep => {
    const step = current !== undefined ? steps[current] : undefined

    return step ?? { render: () => <></> }
  }, [steps, current])

  const tour = useMemo(
    (): TourCtx => ({
      changeSpot,
      current,
      goTo,
      next,
      previous,
      spot,
      start,
      steps,
      stop,
    }),
    [changeSpot, current, goTo, next, previous, spot, start, steps, stop]
  )

  useImperativeHandle(ref, () => ({
    current,
    goTo,
    next,
    previous,
    start,
    stop,
  }))

  return (
    <TourContext.Provider value={tour}>
      {isChildFunction(children) ? <TourContext.Consumer>{children}</TourContext.Consumer> : <>{children}</>}

      <TourOverlay
        color={overlayColor}
        current={current}
        backdropOpacity={overlayOpacity}
        onBackdropPress={onBackdropPress}
        spot={spot}
        tourStep={currentStep}
        nativeDriver={nativeDriver}
      />
    </TourContext.Provider>
  )
})
