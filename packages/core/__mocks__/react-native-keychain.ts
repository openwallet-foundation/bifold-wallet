export const ACCESS_CONTROL = {
  BIOMETRY_ANY: 'BiometryAny',
  BIOMETRY_CURRENT_SET: 'BiometryCurrentSet',
  DEVICE_PASSCODE: 'DevicePasscode',
  BIOMETRY_ANY_OR_DEVICE_PASSCODE: 'BiometryAnyOrDevicePasscode',
  BIOMETRY_CURRENT_SET_OR_DEVICE_PASSCODE: 'BiometryCurrentSetOrDevicePasscode',
}

export const ACCESSIBLE = {
  ALWAYS: 'Always',
  WHEN_UNLOCKED: 'WhenUnlocked',
  AFTER_FIRST_UNLOCK: 'AfterFirstUnlock',
  WHEN_UNLOCKED_THIS_DEVICE_ONLY: 'WhenUnlockedThisDeviceOnly',
  WHEN_PASSCODE_SET_THIS_DEVICE_ONLY: 'WhenPasscodeSetThisDeviceOnly',
  AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY: 'AfterFirstUnlockThisDeviceOnly',
}

export const SECURITY_LEVEL = {
  ANY: 'ANY',
  SECURE_SOFTWARE: 'SECURE_SOFTWARE',
  SECURE_HARDWARE: 'SECURE_HARDWARE',
}

export const STORAGE_TYPE = {
  AES_GCM_NO_AUTH: 'AES_GCM_NO_AUTH',
  RSA: 'RSA',
}

export const BIOMETRY_TYPE = {
  FACE_ID: 'FaceID',
  TOUCH_ID: 'TouchID',
  FINGERPRINT: 'Fingerprint',
  FACE: 'Face',
  IRIS: 'Iris',
}

export const setGenericPassword = jest.fn().mockResolvedValue(true)
export const getGenericPassword = jest.fn().mockResolvedValue(false)
export const resetGenericPassword = jest.fn().mockResolvedValue(true)
export const getSupportedBiometryType = jest.fn().mockResolvedValue(null)

export default {
  ACCESS_CONTROL,
  ACCESSIBLE,
  SECURITY_LEVEL,
  STORAGE_TYPE,
  BIOMETRY_TYPE,
  setGenericPassword,
  getGenericPassword,
  resetGenericPassword,
  getSupportedBiometryType,
}
