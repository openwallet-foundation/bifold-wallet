// Global test setup for React Native testing environment

// Mock React Native batched bridge for native module compatibility
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(global as any).__fbBatchedBridgeConfig = {
  remoteModuleConfig: [],
  localModulesConfig: [],
}

// Mock React Native core modules
jest.mock('react-native', () => ({
  DeviceEventEmitter: {
    addListener: jest.fn(() => ({ remove: jest.fn() })),
    emit: jest.fn(),
  },
  StatusBar: {
    setHidden: jest.fn(),
    setBackgroundColor: jest.fn(),
    setBarStyle: jest.fn(),
  },
  Platform: {
    OS: 'ios',
    select: jest.fn((platforms) => platforms.ios || platforms.default),
  },
  NativeModules: {},
}))

// Mock React Native third-party modules
jest.mock(
  'react-native-splash-screen',
  () => ({
    default: {
      hide: jest.fn(),
      show: jest.fn(),
    },
  }),
  { virtual: true }
)

jest.mock(
  'react-native-toast-message',
  () => ({
    default: {
      show: jest.fn(),
      hide: jest.fn(),
    },
  }),
  { virtual: true }
)

jest.mock(
  'react-native-config',
  () => ({
    default: {},
  }),
  { virtual: true }
)

// Silence React Native animations for testing
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper')

// Global console configuration for tests
global.console = {
  ...console,
  // Uncomment to suppress specific console outputs during testing
  // log: jest.fn(),
  // warn: jest.fn(),
  // error: jest.fn(),
}

// Timer management for tests
beforeEach(() => {
  jest.clearAllTimers()
})

// Basic test to verify setup loads correctly
describe('Test Environment Setup', () => {
  it('should configure React Native mocks correctly', () => {
    expect(jest.isMockFunction(global.console.log)).toBe(false) // Console should not be mocked by default
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((global as any).__fbBatchedBridgeConfig).toBeDefined()
  })
})
