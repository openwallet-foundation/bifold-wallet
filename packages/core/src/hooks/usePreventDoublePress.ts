import { useCallback, useMemo, useRef, useState } from 'react'

/**
 * Prevents double press on a button by disabling the button while the callback is executing.
 *
 * @example
 * ```tsx
 * import { usePreventDoublePress } from './hooks/usePreventDoublePress';
 * const MyButton = () => {
 *   const { preventDoublePress } = usePreventDoublePress();
 *   const handlePress = async () => {};
 *   return <Button onPress={preventDoublePress(handlePress)} title="Press me" />;
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
   * @returns A function that can be used as an onPress handler for a button.
   */
  const preventDoublePress = useCallback(
    <TFunction extends ((...args: any[]) => any) | null | undefined>(callback: TFunction) => {
      if (!callback) {
        return callback
      }

      return async (...args: Parameters<NonNullable<TFunction>>) => {
        if (isPressingRef.current) {
          // Using console.debug here to prevent introducing a new dependency for a single debug log
          // eslint-disable-next-line no-console
          console.debug('[usePreventDoublePress] Double press detected, ignoring.')
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
      }
    },
    []
  )

  return useMemo(() => ({ isPressing, preventDoublePress }), [isPressing, preventDoublePress])
}
