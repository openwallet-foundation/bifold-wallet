import { Linking, Platform } from 'react-native'

import {
  ANDROID_BIOMETRIC_ENROLL_ACTION,
  ANDROID_BIOMETRIC_STRONG,
  ANDROID_EXTRA_BIOMETRIC_AUTHENTICATORS_ALLOWED,
  ANDROID_SECURITY_SETTINGS_ACTION,
  openDeviceBiometricSettings,
} from '../../src/utils/biometrics'

describe('openDeviceBiometricSettings', () => {
  const originalOS = Platform.OS
  const sendIntentSpy = jest.spyOn(Linking, 'sendIntent')
  const openSettingsSpy = jest.spyOn(Linking, 'openSettings')

  beforeEach(() => {
    sendIntentSpy.mockReset().mockResolvedValue(undefined)
    openSettingsSpy.mockReset().mockResolvedValue(undefined)
  })

  afterEach(() => {
    Platform.OS = originalOS
  })

  test('android opens biometric enroll with strong authenticator extra', async () => {
    Platform.OS = 'android'

    await openDeviceBiometricSettings()

    expect(Linking.sendIntent).toHaveBeenCalledTimes(1)
    expect(Linking.sendIntent).toHaveBeenCalledWith(ANDROID_BIOMETRIC_ENROLL_ACTION, [
      { key: ANDROID_EXTRA_BIOMETRIC_AUTHENTICATORS_ALLOWED, value: ANDROID_BIOMETRIC_STRONG },
    ])
    expect(Linking.openSettings).not.toHaveBeenCalled()
  })

  test('android falls back to security settings when enroll intent fails', async () => {
    Platform.OS = 'android'
    ;(Linking.sendIntent as jest.Mock).mockRejectedValueOnce(new Error('enroll unavailable'))

    await openDeviceBiometricSettings()

    expect(Linking.sendIntent).toHaveBeenNthCalledWith(1, ANDROID_BIOMETRIC_ENROLL_ACTION, [
      { key: ANDROID_EXTRA_BIOMETRIC_AUTHENTICATORS_ALLOWED, value: ANDROID_BIOMETRIC_STRONG },
    ])
    expect(Linking.sendIntent).toHaveBeenNthCalledWith(2, ANDROID_SECURITY_SETTINGS_ACTION)
    expect(Linking.openSettings).not.toHaveBeenCalled()
  })

  test('android falls back to app settings when enroll and security intents fail', async () => {
    Platform.OS = 'android'
    ;(Linking.sendIntent as jest.Mock).mockRejectedValue(new Error('intent unavailable'))

    await openDeviceBiometricSettings()

    expect(Linking.sendIntent).toHaveBeenCalledTimes(2)
    expect(Linking.openSettings).toHaveBeenCalledTimes(1)
  })

  test('ios opens app settings', async () => {
    Platform.OS = 'ios'

    await openDeviceBiometricSettings()

    expect(Linking.sendIntent).not.toHaveBeenCalled()
    expect(Linking.openSettings).toHaveBeenCalledTimes(1)
  })
})
