import { createContext, ReactElement, useContext } from 'react'
import { LayoutRectangle } from 'react-native'

export interface RenderProps {
  /**
   * The index of the current step the tour is on.
   */
  current: number
  /**
   * Goes to the next step, if any. Stops the tour on the last step.
   */
  next: () => void
  /**
   * Goes to the previous step, if any.
   */
  previous: () => void
  /**
   * Terminates the tour execution.
   */
  stop: () => void
}

export interface OSConfig<T> {
  /**
   * Generic setting which only applies to Android
   */
  android: T
  /**
   * Generic setting which only applies to iOS
   */
  ios: T
  /**
   * Generic setting which only applies to Web
   */
  web: T
}

export type BackdropPressBehavior = 'continue' | 'stop' | ((options: Tour) => void)

export interface TourStep {
  /**
   * Overrides the behavior of pressing the tour's backdrop for this specific
   * step. You can use either one of the following values:
   * - A callback function with the {@link Tour} options object in the
   * first argument. This allows more granular control over the tour.
   * - The `continue` literal string, which is a shortcut to move to the next
   * step, and stop the tour on the last step.
   * - the `stop` literal string, which is a shortcut to stop the tour.
   *
   * **NOTE:** You can also define a default behavior on the
   * `TourProvider` props.
   */
  onBackdropPress?: BackdropPressBehavior
  /**
   * A function or React function component to render the tooltip of the step.
   * It receives the {@link RenderProps} so you can access the context of the
   * tour within the tooltip.
   */
  render: (props: RenderProps) => ReactElement
}

export interface Tour {
  /**
   * The current step index.
   */
  current?: number
  /**
   * Moves to a specific step.
   *
   * @param index the index of the step to go
   */
  goTo: (index: number) => void
  /**
   * Goes to the next step, if any. Stops the tour on the last step.
   */
  next: () => void
  /**
   * Goes to the previous step, if any.
   */
  previous: () => void
  /**
   * Kicks off the tour from step `0`.
   */
  start: () => void
  /**
   * Terminates the tour execution.
   */
  stop: () => void
}

export interface TourCtx extends Tour {
  /**
   * Programmatically change the spot layout
   *
   * @param spot the spot layout
   */
  changeSpot: (spot: LayoutRectangle) => void
  /**
   * The spotlight layout.
   */
  spot: LayoutRectangle
  /**
   * The list of steps for the tour.
   */
  steps: TourStep[]
}

export const ORIGIN_SPOT: LayoutRectangle = {
  height: 0,
  width: 0,
  x: 0,
  y: 0,
}

export const TourContext = createContext<TourCtx>({
  changeSpot: () => undefined,
  goTo: () => undefined,
  next: () => undefined,
  previous: () => undefined,
  spot: ORIGIN_SPOT,
  start: () => undefined,
  steps: [],
  stop: () => undefined,
})

/**
 * React hook to access the {@link Tour} context.
 *
 * @returns the Tour context
 */
export function useTour(): Tour {
  const { current, goTo, next, previous, start, stop } = useContext(TourContext)

  return {
    current,
    goTo,
    next,
    previous,
    start,
    stop,
  }
}
