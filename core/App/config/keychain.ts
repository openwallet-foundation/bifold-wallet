import { ACCESSIBLE, ACCESS_CONTROL, SECURITY_LEVEL, STORAGE_TYPE } from 'react-native-keychain'

import { keychainServiceKey, keychainServicePINKey, keychainServiceRandKey } from '../constants'

export const keychainOptions = {
  service: keychainServiceKey,
  accessControl: ACCESS_CONTROL.BIOMETRY_CURRENT_SET,
  accessible: ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  securityLevel: SECURITY_LEVEL.ANY,
  storage: STORAGE_TYPE.RSA,
}

export const keychainPinKeyOptions = {
  service: keychainServicePINKey,
  accessControl: ACCESS_CONTROL.BIOMETRY_CURRENT_SET,
  accessible: ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  securityLevel: SECURITY_LEVEL.ANY,
  storage: STORAGE_TYPE.RSA,
}

export const keychainRandKeyOptions = {
  service: keychainServiceRandKey,
  accessControl: ACCESS_CONTROL.BIOMETRY_ANY,
  accessible: ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  securityLevel: SECURITY_LEVEL.ANY,
  storage: STORAGE_TYPE.RSA,
}
