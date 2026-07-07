import { useCallback, useMemo, useRef, useState } from 'react'
import { BifoldLogger } from '../services/logger'

/**
 * Prevents double press on a button by disabling the button while the callback is executing.
 *
 * @example
 * ```tsx
 * import { usePreventDoublePress } from './hooks/usePreventDoublePress';
 * const MyButton = () => {
 *   const { preventDoublePress } = usePreventDoublePress();
 *   const handlePress = async () => {};
 *   return <Button onPress={preventDoublePress(handlePress, logger)} title="Press me" />;
 * }
 * ```
 * @returns An object containing the `preventDoublePress` function.
 */
export const usePreventDoublePress = () => {
  // Note: Using a ref to prevent double presses on the same tick
  const isPressingRef = useRef(false)
  const [isPressing, setIsPressing] = useState(false)

  /**
   * Prevents double press on a button by disabling the button while the callback is executing.
   *
   * @param callback The callback to execute when the button is pressed.
   * @param logger Optional logger to log double press events.
   * @returns A function that can be used as an onPress handler for a button.
   */
  const preventDoublePress = useCallback(
    <T extends (...args: never[]) => unknown>(callback?: T | null, logger?: BifoldLogger) =>
      async (...args: Parameters<T>) => {
        if (isPressingRef.current) {
          logger?.debug('[usePreventDoublePress] Double press detected, ignoring.')
          return
        }

        setIsPressing(true)
        isPressingRef.current = true

        try {
          await callback?.(...args)
        } finally {
          setIsPressing(false)
          isPressingRef.current = false
        }
      },
    []
  )

  return useMemo(() => ({ isPressing, preventDoublePress }), [isPressing, preventDoublePress])
}
