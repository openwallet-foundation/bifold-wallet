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
