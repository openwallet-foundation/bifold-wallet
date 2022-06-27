import { ACCESSIBLE, ACCESS_CONTROL, SECURITY_LEVEL, STORAGE_TYPE } from 'react-native-keychain'

import { KEYCHAIN_SERVICE_KEY, KEYCHAIN_SERVICE_PIN_KEY, KEYCHAIN_SERVICE_RAND_KEY } from '../constants'

export const keychainOptions = {
  service: KEYCHAIN_SERVICE_KEY,
  accessControl: ACCESS_CONTROL.BIOMETRY_CURRENT_SET,
  accessible: ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  securityLevel: SECURITY_LEVEL.ANY,
  storage: STORAGE_TYPE.RSA,
}

export const keychainPinKeyOptions = {
  service: KEYCHAIN_SERVICE_PIN_KEY,
  accessControl: ACCESS_CONTROL.BIOMETRY_CURRENT_SET,
  accessible: ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  securityLevel: SECURITY_LEVEL.ANY,
  storage: STORAGE_TYPE.RSA,
}

export const keychainRandKeyOptions = {
  service: KEYCHAIN_SERVICE_RAND_KEY,
  accessControl: ACCESS_CONTROL.BIOMETRY_ANY,
  accessible: ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  securityLevel: SECURITY_LEVEL.ANY,
  storage: STORAGE_TYPE.RSA,
}
