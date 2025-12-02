/* eslint-disable no-undef */
// eslint-disable-next-line import/no-extraneous-dependencies
import 'reflect-metadata'
import 'react-native-gesture-handler/jestSetup'
import mockRNCNetInfo from '@react-native-community/netinfo/jest/netinfo-mock.js'
import mockRNLocalize from 'react-native-localize/mock'
import mockRNDeviceInfo from 'react-native-device-info/jest/react-native-device-info-mock'
import mockSafeAreaContext from 'react-native-safe-area-context/jest/mock'

mockRNDeviceInfo.getVersion = jest.fn(() => '1')
mockRNDeviceInfo.getBuildNumber = jest.fn(() => '1')

jest.mock('react-native-safe-area-context', () => mockSafeAreaContext)
jest.mock('react-native-device-info', () => mockRNDeviceInfo)
jest.mock('@react-native-community/netinfo', () => mockRNCNetInfo)

// Mock Animated native helper - path changed in RN 0.81+
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native')
  RN.NativeModules.NativeAnimatedModule = {
    startOperationBatch: jest.fn(),
    finishOperationBatch: jest.fn(),
    createAnimatedNode: jest.fn(),
    updateAnimatedNodeConfig: jest.fn(),
    getValue: jest.fn(),
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
    addListener: jest.fn(),
    removeListeners: jest.fn(),
  }
  return RN
})
jest.mock('react-native-localize', () => mockRNLocalize)
jest.mock('react-native-orientation-locker', () => ({
  useOrientationChange: jest.fn(),
  OrientationType: {
    PORTRAIT: 'PORTRAIT',
    'PORTRAIT-UPSIDEDOWN': 'PORTRAIT-UPSIDEDOWN',
    'LANDSCAPE-LEFT': 'LANDSCAPE-LEFT',
    'LANDSCAPE-RIGHT': 'LANDSCAPE-RIGHT',
    FACE_UP: 'FACE-UP',
    FACE_DOWN: 'FACE-DOWN',
    UNKNOWN: 'UNKNOWN',
  },
  lockToPortrait: jest.fn(),
  lockToLandscape: jest.fn(),
  lockToLandscapeLeft: jest.fn(),
  lockToLandscapeRight: jest.fn(),
  unlockAllOrientations: jest.fn(),
  getOrientation: jest.fn(),
  getDeviceOrientation: jest.fn(),
  addOrientationListener: jest.fn(),
  removeOrientationListener: jest.fn(),
  addDeviceOrientationListener: jest.fn(),
  removeDeviceOrientationListener: jest.fn(),
}))
jest.mock('react-native-fs', () => ({}))
jest.mock('@hyperledger/anoncreds-react-native', () => ({}))
jest.mock('@hyperledger/aries-askar-react-native', () => ({}))
jest.mock('@hyperledger/indy-vdr-react-native', () => ({}))
jest.mock('react-native-permissions', () => require('react-native-permissions/mock'))
jest.mock('react-native-vision-camera', () => {
  return require('./__mocks__/custom/react-native-camera')
})

jest.mock('react-native-keyboard-aware-scroll-view', () => {
  const { ScrollView } = jest.requireActual('react-native')
  return {
    KeyboardAwareScrollView: ScrollView,
  }
})

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
