import React, { forwardRef, Ref, useCallback, useImperativeHandle, useMemo, useState } from 'react'
import { ColorValue, LayoutRectangle } from 'react-native'

import { TourOverlay } from '../../components/tour/TourOverlay'
import { ChildFn, TourID } from '../../types/tour'
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
   * The list of steps for the home tour.
   */
  homeTourSteps: TourStep[]
  /**
   * Same as above for the credential list screen
   */
  credentialsTourSteps: TourStep[]
  /**
   * Same as above for the credential offer screen
   */
  credentialOfferTourSteps: TourStep[]
  /**
   * Same as above for the proof request screen
   */
  proofRequestTourSteps: TourStep[]
}

const TourProviderComponent = (props: TourProviderProps, ref:  Ref<Tour>) => {
  const {
    children,
    onBackdropPress,
    overlayColor = 'black',
    overlayOpacity = 0.45,
    homeTourSteps,
    credentialsTourSteps,
    credentialOfferTourSteps,
    proofRequestTourSteps,
    nativeDriver = false,
  } = props

  const [currentTour, setCurrentTour] = useState<TourID>(TourID.HomeTour)
  const [currentStep, setCurrentStep] = useState<number>()
  const [spot, setSpot] = useState(ORIGIN_SPOT)

  const renderStep = useCallback(
    (index: number): void | Promise<void> => {
      if (
        (currentTour === TourID.HomeTour && homeTourSteps[index] !== undefined) ||
        (currentTour === TourID.CredentialsTour && credentialsTourSteps[index] !== undefined) ||
        (currentTour === TourID.CredentialOfferTour && credentialOfferTourSteps[index] !== undefined) ||
        (currentTour === TourID.ProofRequestTour && proofRequestTourSteps[index] !== undefined)
      ) {
        setCurrentStep(index)
      }
    },
    [currentTour, homeTourSteps, credentialsTourSteps, credentialOfferTourSteps, proofRequestTourSteps]
  )

  const changeSpot = useCallback((newSpot: LayoutRectangle): void => {
    setSpot(newSpot)
  }, [])

  const start = useCallback(
    (tourId: TourID): void => {
      setCurrentTour(tourId)
      renderStep(0)
    },
    [renderStep]
  )

  const stop = useCallback((): void => {
    setCurrentStep(undefined)
    setSpot(ORIGIN_SPOT)
  }, [])

  const next = useCallback((): void => {
    let steps = homeTourSteps
    if (currentTour === TourID.CredentialsTour) {
      steps = credentialsTourSteps
    } else if (currentTour === TourID.CredentialOfferTour) {
      steps = credentialOfferTourSteps
    } else if (currentTour === TourID.ProofRequestTour) {
      steps = proofRequestTourSteps
    }

    if (currentStep !== undefined) {
      currentStep === steps.length - 1 ? stop() : renderStep(currentStep + 1)
    }
  }, [
    stop,
    renderStep,
    currentStep,
    currentTour,
    homeTourSteps,
    credentialsTourSteps,
    credentialOfferTourSteps,
    proofRequestTourSteps,
  ])

  // works the same regardless of which tour is on
  const previous = useCallback((): void => {
    if (currentStep !== undefined && currentStep > 0) {
      renderStep(currentStep - 1)
    }
  }, [renderStep, currentStep])

  const tourStep = useMemo((): TourStep => {
    let stepToRender = undefined
    let steps = homeTourSteps
    if (currentTour === TourID.CredentialsTour) {
      steps = credentialsTourSteps
    } else if (currentTour === TourID.CredentialOfferTour) {
      steps = credentialOfferTourSteps
    } else if (currentTour === TourID.ProofRequestTour) {
      steps = proofRequestTourSteps
    }

    stepToRender = currentStep !== undefined ? steps[currentStep] : undefined
    return stepToRender ?? { Render: () => <></> }
  }, [homeTourSteps, credentialsTourSteps, credentialOfferTourSteps, proofRequestTourSteps, currentStep])

  const tour = useMemo(
    (): TourCtx => ({
      changeSpot,
      currentTour,
      currentStep,
      next,
      previous,
      spot,
      start,
      stop,
      homeTourSteps,
      credentialsTourSteps,
      credentialOfferTourSteps,
      proofRequestTourSteps,
    }),
    [
      changeSpot,
      currentTour,
      currentStep,
      next,
      previous,
      spot,
      start,
      stop,
      homeTourSteps,
      credentialsTourSteps,
      credentialOfferTourSteps,
      proofRequestTourSteps,
    ]
  )

  useImperativeHandle(ref, () => ({
    currentTour,
    currentStep,
    changeSpot,
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
        currentStep={currentStep}
        currentTour={currentTour}
        changeSpot={changeSpot}
        backdropOpacity={overlayOpacity}
        onBackdropPress={onBackdropPress}
        spot={spot}
        tourStep={tourStep}
        nativeDriver={nativeDriver}
      />
    </TourContext.Provider>
  )
}

export const TourProvider = forwardRef<Tour, TourProviderProps>(TourProviderComponent)