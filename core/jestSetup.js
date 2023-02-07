/* eslint-disable no-undef */
import 'react-native-gesture-handler/jestSetup'
import mockRNLocalize from 'react-native-localize/mock'

jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper')
jest.mock('react-native/Libraries/EventEmitter/NativeEventEmitter')
jest.mock('react-native-localize', () => mockRNLocalize)
