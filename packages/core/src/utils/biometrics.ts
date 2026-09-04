import { Linking, Platform } from 'react-native'

// Settings.ACTION_BIOMETRIC_ENROLL (API 30+)
export const ANDROID_BIOMETRIC_ENROLL_ACTION = 'android.settings.BIOMETRIC_ENROLL'
// Settings.ACTION_SECURITY_SETTINGS
export const ANDROID_SECURITY_SETTINGS_ACTION = 'android.settings.SECURITY_SETTINGS'
// Settings.EXTRA_BIOMETRIC_AUTHENTICATORS_ALLOWED
export const ANDROID_EXTRA_BIOMETRIC_AUTHENTICATORS_ALLOWED = 'android.provider.extra.BIOMETRIC_AUTHENTICATORS_ALLOWED'
// BiometricManager.Authenticators.BIOMETRIC_STRONG
export const ANDROID_BIOMETRIC_STRONG = 15

const trySendAndroidIntent = async (
  action: string,
  extras?: Array<{ key: string; value: string | number | boolean }>
): Promise<boolean> => {
  try {
    if (extras) {
      await Linking.sendIntent(action, extras)
    } else {
      await Linking.sendIntent(action)
    }
    return true
  } catch {
    return false
  }
}

/**
 * Opens the OS screen where the user can enroll biometrics.
 * Android: biometric enrollment, then security settings, then app settings.
 * iOS: app settings, because Apple does not provide a public Face ID / Touch ID URL.
 */
export const openDeviceBiometricSettings = async (): Promise<void> => {
  if (Platform.OS === 'android') {
    const openedEnroll = await trySendAndroidIntent(ANDROID_BIOMETRIC_ENROLL_ACTION, [
      { key: ANDROID_EXTRA_BIOMETRIC_AUTHENTICATORS_ALLOWED, value: ANDROID_BIOMETRIC_STRONG },
    ])
    if (openedEnroll) {
      return
    }

    const openedSecurity = await trySendAndroidIntent(ANDROID_SECURITY_SETTINGS_ACTION)
    if (openedSecurity) {
      return
    }
  }

  await Linking.openSettings()
}
