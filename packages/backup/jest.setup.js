/**
 * Jest setup file for @bifold/backup
 */

// Required for tsyringe
import 'reflect-metadata'

// Mock React Native modules
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper', () => ({
  API: {
    createAnimatedNode: jest.fn(),
    startListeningToAnimatedNodeValue: jest.fn(),
    stopListeningToAnimatedNodeValue: jest.fn(),
    connectAnimatedNodes: jest.fn(),
    disconnectAnimatedNodes: jest.fn(),
    startAnimatingNode: jest.fn(),
    stopAnimation: jest.fn(),
    setAnimatedNodeValue: jest.fn(),
    setAnimatedNodeOffset: jest.fn(),
    flattenAnimatedNodeOffset: jest.fn(),
    extractAnimatedNodeOffset: jest.fn(),
    connectAnimatedNodeToView: jest.fn(),
    disconnectAnimatedNodeFromView: jest.fn(),
    restoreDefaultValues: jest.fn(),
    dropAnimatedNode: jest.fn(),
    addAnimatedEventToView: jest.fn(),
    removeAnimatedEventFromView: jest.fn(),
    getValue: jest.fn(),
    flushQueue: jest.fn(),
  },
  addWhitelistedNativeProps: jest.fn(),
  addWhitelistedUIProps: jest.fn(),
  validateStyles: jest.fn(),
  validateTransform: jest.fn(),
  validateInterpolation: jest.fn(),
  generateNewNodeTag: jest.fn(() => 1),
  generateNewAnimationId: jest.fn(() => 1),
  assertNativeAnimatedModule: jest.fn(),
  shouldUseNativeDriver: jest.fn(() => false),
  transformDataType: jest.fn((value) => value),
}))

// Mock NativeEventEmitter
jest.mock('react-native/Libraries/EventEmitter/NativeEventEmitter')

// Mock react-native-fs
jest.mock('react-native-fs', () => ({
  DocumentDirectoryPath: '/mock/documents',
  CachesDirectoryPath: '/mock/caches',
  exists: jest.fn(),
  unlink: jest.fn(),
  mkdir: jest.fn(),
  readDir: jest.fn(),
  stat: jest.fn(),
  RNFSFileTypeRegular: 0,
  RNFSFileTypeDirectory: 1,
}))

// Mock react-native-share
jest.mock('react-native-share', () => ({
  open: jest.fn().mockResolvedValue(undefined),
}))

// Mock react-native-keychain (if it exists)
try {
  jest.mock('react-native-keychain', () => ({
    ACCESSIBLE: {
      ALWAYS: 'Always',
      WHEN_UNLOCKED_THIS_DEVICE_ONLY: 'WhenUnlockedThisDeviceOnly',
    },
    ACCESS_CONTROL: {
      BIOMETRY_ANY: 'BiometryAny',
    },
    SECURITY_LEVEL: {
      ANY: 'Any',
    },
    STORAGE_TYPE: {
      AES: 'AES',
      RSA: 'RSA',
    },
    setGenericPassword: jest.fn(),
    getGenericPassword: jest.fn(),
    resetGenericPassword: jest.fn(),
  }))
} catch (e) {
  // Module not found, skip mock
}

// Mock react-native-quick-crypto
jest.mock('react-native-quick-crypto', () => ({
  randomBytes: jest.fn(),
  createCipheriv: jest.fn(),
  createDecipheriv: jest.fn(),
  pbkdf2: jest.fn(),
}))

// Mock react-native-zip-archive
jest.mock('react-native-zip-archive', () => ({
  zip: jest.fn().mockResolvedValue(undefined),
  unzip: jest.fn().mockResolvedValue(undefined),
}))

// Mock react-native-document-picker
jest.mock('react-native-document-picker', () => ({
  pickSingle: jest.fn(),
  isCancel: jest.fn(() => false),
  types: {
    allFiles: 'allFiles',
  },
}))

// Silence console warnings during tests
const originalWarn = console.warn
console.warn = (...args) => {
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('Animated: `useNativeDriver`') ||
      args[0].includes('Native animated module is not available'))
  ) {
    return
  }
  originalWarn.apply(console, args)
}
