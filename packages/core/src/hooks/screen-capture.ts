import { useEffect } from 'react'
import { CaptureProtection } from 'react-native-capture-protection'

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

    CaptureProtection.preventScreenshot()

    return () => {
      CaptureProtection.allowScreenshot(true)
    }
  }, [active])
}

export default usePreventScreenCapture