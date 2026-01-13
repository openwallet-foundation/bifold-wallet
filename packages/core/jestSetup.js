/* eslint-disable no-undef */
// eslint-disable-next-line import/no-extraneous-dependencies
import 'reflect-metadata'
import 'react-native-gesture-handler/jestSetup'
import mockRNCNetInfo from '@react-native-community/netinfo/jest/netinfo-mock.js'
import mockRNLocalize from 'react-native-localize/mock'
import mockRNDeviceInfo from 'react-native-device-info/jest/react-native-device-info-mock'
import mockSafeAreaContext from 'react-native-safe-area-context/jest/mock'
import path from 'path'

// React 18+/19: enable proper act() behavior in tests
globalThis.IS_REACT_ACT_ENVIRONMENT = true
global.IS_REACT_ACT_ENVIRONMENT = true

mockRNDeviceInfo.getVersion = jest.fn(() => '1')
mockRNDeviceInfo.getBuildNumber = jest.fn(() => '1')

jest.mock('react-native-safe-area-context', () => mockSafeAreaContext)
jest.mock('react-native-device-info', () => mockRNDeviceInfo)
jest.mock('@react-native-community/netinfo', () => mockRNCNetInfo)
jest.mock('react-native/src/private/animated/NativeAnimatedHelper')
jest.mock('react-native/Libraries/EventEmitter/NativeEventEmitter')
jest.mock('react-native-localize', () => mockRNLocalize)
jest.mock('react-native-fs', () => ({}))
jest.mock('@hyperledger/anoncreds-react-native', () => ({}))
jest.mock('@hyperledger/aries-askar-react-native', () => ({}))
jest.mock('@hyperledger/indy-vdr-react-native', () => ({}))
jest.mock('react-native-permissions', () => require('react-native-permissions/mock'))
jest.mock('react-native-vision-camera', () => {
  return require('./__mocks__/custom/react-native-camera')
})

/* -------------------------------------------------------------------------- */
/* MOCK REFRESH ORCHESTRATOR (AVOID TIMERS / LOGS DURING TESTS)            */
/* -------------------------------------------------------------------------- */

const refreshOrchestratorPath = path.resolve(__dirname, 'src/modules/openid/refresh/RefreshOrchestrator')

jest.mock(refreshOrchestratorPath, () => {
  return {
    RefreshOrchestrator: jest.fn().mockImplementation(() => ({
      configure: jest.fn(),
      start: jest.fn(),
      stop: jest.fn(),
      runOnce: jest.fn(),
    })),
  }
})

jest.mock('react-native-keyboard-controller', () => {
  const { ScrollView } = jest.requireActual('react-native')
  return {
    KeyboardProvider: ({ children }) => children,
    KeyboardAwareScrollView: ScrollView,
  }
})

// Mock Keyboard to fix KeyboardAvoidingView cleanup issues in tests
// React Native 0.81+ exports Keyboard as .default
const mockKeyboard = {
  addListener: jest.fn(() => ({ remove: jest.fn() })),
  removeListener: jest.fn(),
  dismiss: jest.fn(),
  scheduleLayoutAnimation: jest.fn(),
  isVisible: jest.fn(() => false),
  metrics: jest.fn(() => null),
}
jest.mock('react-native/Libraries/Components/Keyboard/Keyboard', () => ({
  default: mockKeyboard,
  ...mockKeyboard,
}))

// Fix timezone issues in tests
process.env.TZ = 'UTC' // or 'America/Toronto' — pick one and keep it fixed
// Freeze "now" without enabling fake timers (prevents act() overlaps)
const FIXED_NOW = new Date('2024-01-01T00:00:00Z').valueOf()
let dateNowSpy

beforeAll(() => {
  dateNowSpy = jest.spyOn(Date, 'now').mockImplementation(() => FIXED_NOW)
})

afterAll(() => {
  if (dateNowSpy) dateNowSpy.mockRestore()
})
