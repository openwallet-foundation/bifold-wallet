import { Config } from 'react-native-config'
import { ACCESSIBLE, ACCESS_CONTROL, SECURITY_LEVEL, STORAGE_TYPE } from 'react-native-keychain'

export const keychainOptions = {
  service: Config.KC_SERVICE_GROUP,
  accessControl: ACCESS_CONTROL.BIOMETRY_ANY,
  accessible: ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  securityLevel: SECURITY_LEVEL.ANY,
  storage: STORAGE_TYPE.RSA,
}

export const keychainWalletIDOptions = {
  service: Config.KC_SERVICE_GROUP,
  accessControl: ACCESS_CONTROL.USER_PRESENCE,
  accessible: ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  securityLevel: SECURITY_LEVEL.ANY,
  storage: STORAGE_TYPE.RSA,
}
