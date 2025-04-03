import { useEffect } from 'react'
import { CaptureProtection } from 'react-native-capture-protection'
import { TOKENS, useServices } from '../container-api'

/**
 * Prevents screenshots when component is mounted. When unmounted, allows them again
 * 
 * @param {boolean} [active=true] - If `false`, hook does nothing
 * @remarks
 * - If the config boolean `preventScreenCapture` is `true` and the
 * `active` param is `true` it prevents screenshots when the component is mounted
 * - On component unmount, it restores the ability to take screenshots
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
  const [{ preventScreenCapture }] = useServices([TOKENS.CONFIG])

  useEffect(() => {
    if (!active || !preventScreenCapture) return

    CaptureProtection.preventScreenshot()

    return () => {
      CaptureProtection.allowScreenshot(true)
    }
  }, [active, preventScreenCapture])
}

export default usePreventScreenCapture