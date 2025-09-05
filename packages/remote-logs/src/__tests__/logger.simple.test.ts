import { DeviceEventEmitter } from 'react-native'
import { logger } from 'react-native-logs'

// Mock external dependencies for isolated testing
jest.mock('react-native', () => ({
  DeviceEventEmitter: {
    addListener: jest.fn(),
    emit: jest.fn(),
  },
}))

jest.mock('react-native-logs', () => ({
  logger: {
    createLogger: jest.fn(() => ({
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    })),
  },
}))

jest.mock('axios')

/**
 * Basic integration tests for RemoteLogger module
 * These tests verify module structure and basic functionality
 * without testing complex business logic (covered in comprehensive tests)
 */
describe('RemoteLogger Module Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Module Dependencies', () => {
    it('should have access to required React Native modules', () => {
      expect(logger).toBeDefined()
      expect(logger.createLogger).toBeDefined()
      expect(DeviceEventEmitter).toBeDefined()
    })

    it('should export transport functions from transports module', () => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { lokiTransport, consoleTransport } = require('../transports')

      expect(lokiTransport).toBeDefined()
      expect(consoleTransport).toBeDefined()
      expect(typeof lokiTransport).toBe('function')
      expect(typeof consoleTransport).toBe('function')
    })
  })

  describe('Module Structure', () => {
    it('should provide consistent API surface', () => {
      // Verify the module exports what consumers expect
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const transportsModule = require('../transports')

      expect(transportsModule).toHaveProperty('lokiTransport')
      expect(transportsModule).toHaveProperty('consoleTransport')

      // Verify both transports are functions
      expect(typeof transportsModule.lokiTransport).toBe('function')
      expect(typeof transportsModule.consoleTransport).toBe('function')
    })
  })
})
