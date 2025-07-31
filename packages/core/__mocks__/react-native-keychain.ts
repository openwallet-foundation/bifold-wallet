const ACCESS_CONTROL = jest.fn()
const ACCESSIBLE = {
  ALWAYS: 'Always',
  WHEN_UNLOCKED_THIS_DEVICE_ONLY: 'WhenUnlockedThisDeviceOnly',
}
const SECURITY_LEVEL = jest.fn()
const STORAGE_TYPE = jest.fn()
const setGenericPassword = jest.fn().mockResolvedValue(true)

export default {
  ACCESS_CONTROL,
  ACCESSIBLE,
  SECURITY_LEVEL,
  STORAGE_TYPE,
  setGenericPassword,
}
