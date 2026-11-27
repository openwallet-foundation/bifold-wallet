import { useEffect, useState } from 'react'
import { AccessibilityInfo } from 'react-native'

import { TOKENS, useServices } from '../container-api'

/**
 * Whether the OS reports colour inversion as on, kept current while mounted.
 *
 * Android: the colour inversion setting as React Native last read it. React Native re-reads it each
 * time the app comes to the foreground, not while the app stays open, so toggling inversion from
 * Quick Settings or the accessibility shortcut shows here once the app is next reopened.
 *
 * iOS: `UIAccessibility.isInvertColorsEnabled`, which Apple documents as Classic Invert but which has
 * been reported to follow Smart Invert. Don't redraw from it on iOS; opt a view out of Smart Invert
 * with `accessibilityIgnoresInvertColors` instead (see `QRRenderer`).
 */
export const useInvertColorsEnabled = (): boolean => {
  const [logger] = useServices([TOKENS.UTIL_LOGGER])
  const [isEnabled, setIsEnabled] = useState(false)

  useEffect(() => {
    // Set once a change event arrives (or on unmount): the initial query may have read the
    // setting before that change, so its late answer must not overwrite the event's.
    let queryIsStale = false

    const subscription = AccessibilityInfo.addEventListener('invertColorsChanged', (enabled) => {
      queryIsStale = true
      setIsEnabled(enabled)
    })

    AccessibilityInfo.isInvertColorsEnabled()
      .then((enabled) => {
        if (!queryIsStale) {
          setIsEnabled(enabled)
        }
      })
      .catch((error: unknown) => {
        // Not critical: callers draw as if inversion is off, which is how they drew before reading it
        logger.warn('[useInvertColorsEnabled] Could not read the colour inversion setting', {
          message: error instanceof Error ? error.message : String(error),
        })
      })

    return () => {
      queryIsStale = true
      subscription.remove()
    }
  }, [logger])

  return isEnabled
}
