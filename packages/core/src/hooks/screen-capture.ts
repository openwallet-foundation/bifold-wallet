import { useEffect } from 'react'
import { Platform } from 'react-native'
import ScreenGuardModule from 'react-native-screenguard'

export const screenGuardOptions = {
  timeAfterResume: 500, // milliseconds
  backgroundColor: '#000000', // black
}

/**
 * Prevents screenshots when component is mounted. When unmounted, allows them again
 *
 * @param {boolean} [active=true] - If `false`, hook does nothing
 * @remarks
 * - If `active` param is `true`, it prevents screenshots when the
 * component is mounted
 * - On unmount, or when `active` is changed to false, it restores
 * the ability to take screenshots
 * - Should be used at the screen level only
 *
 * @example
 * ```tsx
 * import usePreventScreenCapture from './hooks/screen-capture';
 *
 * const MyScreen = () => {
 *   usePreventScreenCapture();
 *   return <View><Text>Secure Content</Text></View>;
 * };
 * ```
 *
 * @returns {void}
 */
const usePreventScreenCapture = (active: boolean = true) => {
  useEffect(() => {
    if (!active) return

    if (Platform.OS === 'android') {
      // on Android, plain `register` will trigger AppState to
      // change momentarily, which can have side effects.
      // `registerWithoutEffect` prevents that
      ScreenGuardModule.registerWithoutEffect()
    } else {
      ScreenGuardModule.register(screenGuardOptions)
    }

    return () => {
      ScreenGuardModule.unregister()
    }
  }, [active])
}

export default usePreventScreenCapture
