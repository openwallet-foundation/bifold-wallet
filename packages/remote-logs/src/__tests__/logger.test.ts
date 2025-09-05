import { DeviceEventEmitter } from 'react-native'
import { logger } from 'react-native-logs'

import { RemoteLogger, RemoteLoggerEventTypes } from '../logger'
import { lokiTransport } from '../transports'

// Mock dependencies
jest.mock('react-native', () => ({
  DeviceEventEmitter: {
    addListener: jest.fn(),
  },
}))

jest.mock('react-native-logs', () => ({
  logger: {
    createLogger: jest.fn(),
  },
}))

jest.mock('../transports', () => ({
  lokiTransport: jest.fn(),
  consoleTransport: jest.fn(),
}))

describe('RemoteLogger', () => {
  let remoteLogger: RemoteLogger
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockLogger: any
  let mockCreateLogger: jest.MockedFunction<typeof logger.createLogger>
  let mockLokiTransport: jest.MockedFunction<typeof lokiTransport>

  const defaultOptions = {
    lokiUrl: 'https://user:pass@loki.example.com/loki/api/v1/push',
    lokiLabels: { app: 'test-app', env: 'test' },
    autoDisableRemoteLoggingIntervalInMinutes: 60,
  }

  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()

    mockLogger = {
      test: jest.fn(),
      trace: jest.fn(),
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      fatal: jest.fn(),
    }

    mockCreateLogger = logger.createLogger as jest.MockedFunction<typeof logger.createLogger>
    mockCreateLogger.mockReturnValue(mockLogger)

    mockLokiTransport = lokiTransport as jest.MockedFunction<typeof lokiTransport>

    remoteLogger = new RemoteLogger(defaultOptions)
  })

  afterEach(() => {
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
  })

  describe('constructor', () => {
    it('should initialize with default values', () => {
      const logger = new RemoteLogger({})
      expect(logger.remoteLoggingEnabled).toBe(false)
      expect(logger.autoDisableRemoteLoggingIntervalInMinutes).toBe(0)
    })

    it('should initialize with provided options', () => {
      expect(remoteLogger.autoDisableRemoteLoggingIntervalInMinutes).toBe(60)
    })

    it('should configure logger on initialization', () => {
      expect(mockCreateLogger).toHaveBeenCalled()
    })
  })

  describe('sessionId', () => {
    it('should generate a sessionId when accessed for the first time', () => {
      const sessionId = remoteLogger.sessionId
      expect(sessionId).toBeGreaterThanOrEqual(100000)
      expect(sessionId).toBeLessThan(1000000)
    })

    it('should return the same sessionId on subsequent calls', () => {
      const sessionId1 = remoteLogger.sessionId
      const sessionId2 = remoteLogger.sessionId
      expect(sessionId1).toBe(sessionId2)
    })

    it('should allow setting a custom sessionId', () => {
      remoteLogger.sessionId = 123456
      expect(remoteLogger.sessionId).toBe(123456)
    })

    it('should reconfigure logger when sessionId is set', () => {
      mockCreateLogger.mockClear()
      remoteLogger.sessionId = 123456
      expect(mockCreateLogger).toHaveBeenCalled()
    })
  })

  describe('remoteLoggingEnabled', () => {
    it('should start as false', () => {
      expect(remoteLogger.remoteLoggingEnabled).toBe(false)
    })

    it('should enable remote logging', () => {
      remoteLogger.remoteLoggingEnabled = true
      expect(remoteLogger.remoteLoggingEnabled).toBe(true)
    })

    it('should clear sessionId when disabled', () => {
      const sessionId = remoteLogger.sessionId // Generate a sessionId
      expect(sessionId).toBeDefined()

      remoteLogger.remoteLoggingEnabled = false
      // Access sessionId again to trigger regeneration
      const newSessionId = remoteLogger.sessionId
      expect(newSessionId).not.toBe(sessionId)
    })

    it('should reconfigure logger when toggled', () => {
      mockCreateLogger.mockClear()
      remoteLogger.remoteLoggingEnabled = true
      expect(mockCreateLogger).toHaveBeenCalled()
    })
  })

  describe('auto-disable timer', () => {
    it('should set timer when remote logging is enabled with auto-disable', () => {
      remoteLogger.remoteLoggingEnabled = true

      expect(remoteLogger.remoteLoggingEnabled).toBe(true)

      // Fast-forward time
      jest.advanceTimersByTime(60 * 60 * 1000) // 60 minutes

      expect(remoteLogger.remoteLoggingEnabled).toBe(false)
    })

    it('should not set timer when auto-disable is 0', () => {
      const loggerWithoutAutoDisable = new RemoteLogger({
        lokiUrl: 'https://test.com',
        autoDisableRemoteLoggingIntervalInMinutes: 0,
      })

      loggerWithoutAutoDisable.remoteLoggingEnabled = true

      jest.advanceTimersByTime(60 * 60 * 1000) // 60 minutes

      expect(loggerWithoutAutoDisable.remoteLoggingEnabled).toBe(true)
    })
  })

  describe('overrideCurrentAutoDisableExpiration', () => {
    it('should update the auto-disable timer', () => {
      remoteLogger.remoteLoggingEnabled = true

      remoteLogger.overrideCurrentAutoDisableExpiration(30) // 30 minutes

      // Should not disable after original time (60 minutes)
      jest.advanceTimersByTime(60 * 60 * 1000)
      expect(remoteLogger.remoteLoggingEnabled).toBe(true)

      // Should disable after new time (30 minutes from override)
      jest.advanceTimersByTime(30 * 60 * 1000)
      expect(remoteLogger.remoteLoggingEnabled).toBe(false)
    })

    it('should ignore invalid expiration times', () => {
      remoteLogger.remoteLoggingEnabled = true
      remoteLogger.overrideCurrentAutoDisableExpiration(0)
      remoteLogger.overrideCurrentAutoDisableExpiration(-5)

      // Should still use original timer
      jest.advanceTimersByTime(60 * 60 * 1000)
      expect(remoteLogger.remoteLoggingEnabled).toBe(false)
    })
  })

  describe('event listeners', () => {
    it('should start event listeners', () => {
      const mockAddListener = DeviceEventEmitter.addListener as jest.Mock
      remoteLogger.startEventListeners()

      expect(mockAddListener).toHaveBeenCalledWith(RemoteLoggerEventTypes.ENABLE_REMOTE_LOGGING, expect.any(Function))
    })

    it('should handle remote logging toggle events', () => {
      const mockAddListener = DeviceEventEmitter.addListener as jest.Mock
      let eventHandler: (value: boolean) => void

      mockAddListener.mockImplementation((event, handler) => {
        eventHandler = handler
        return { remove: jest.fn() }
      })

      remoteLogger.startEventListeners()

      // Simulate event
      eventHandler!(true)
      expect(remoteLogger.remoteLoggingEnabled).toBe(true)

      eventHandler!(false)
      expect(remoteLogger.remoteLoggingEnabled).toBe(false)
    })

    it('should stop event listeners', () => {
      remoteLogger.startEventListeners()
      remoteLogger.stopEventListeners()
      // This mainly tests that the method exists and doesn't throw
    })
  })

  describe('logging methods', () => {
    const testCases = [
      { method: 'test', data: { test: 'data' } },
      { method: 'trace', data: { trace: 'data' } },
      { method: 'debug', data: { debug: 'data' } },
      { method: 'info', data: { info: 'data' } },
      { method: 'warn', data: { warn: 'data' } },
    ]

    testCases.forEach(({ method, data }) => {
      describe(method, () => {
        it(`should call ${method} with message only`, () => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (remoteLogger as any)[method]('test message')

          expect(mockLogger[method]).toHaveBeenCalledWith({
            message: 'test message',
            data: undefined,
          })
        })

        it(`should call ${method} with message and data`, () => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (remoteLogger as any)[method]('test message', data)

          expect(mockLogger[method]).toHaveBeenCalledWith({
            message: 'test message',
            data,
          })
        })
      })
    })

    describe('error method overloads', () => {
      const testError = new Error('Test error')

      it('should handle message only', () => {
        remoteLogger.error('error message')

        expect(mockLogger.error).toHaveBeenCalledWith({
          message: 'error message',
          data: undefined,
          error: undefined,
        })
      })

      it('should handle message with data', () => {
        const data = { userId: 123 }
        remoteLogger.error('error message', data)

        expect(mockLogger.error).toHaveBeenCalledWith({
          message: 'error message',
          data,
          error: undefined,
        })
      })

      it('should handle message with error', () => {
        remoteLogger.error('error message', testError)

        expect(mockLogger.error).toHaveBeenCalledWith({
          message: 'error message',
          data: undefined,
          error: testError,
        })
      })

      it('should handle message with data and error', () => {
        const data = { userId: 123 }
        remoteLogger.error('error message', data, testError)

        expect(mockLogger.error).toHaveBeenCalledWith({
          message: 'error message',
          data,
          error: testError,
        })
      })
    })

    describe('fatal method overloads', () => {
      const testError = new Error('Test fatal error')

      it('should handle message only', () => {
        remoteLogger.fatal('fatal message')

        expect(mockLogger.fatal).toHaveBeenCalledWith({
          message: 'fatal message',
          data: undefined,
          error: undefined,
        })
      })

      it('should handle message with data', () => {
        const data = { userId: 123 }
        remoteLogger.fatal('fatal message', data)

        expect(mockLogger.fatal).toHaveBeenCalledWith({
          message: 'fatal message',
          data,
          error: undefined,
        })
      })

      it('should handle message with error', () => {
        remoteLogger.fatal('fatal message', testError)

        expect(mockLogger.fatal).toHaveBeenCalledWith({
          message: 'fatal message',
          data: undefined,
          error: testError,
        })
      })

      it('should handle message with data and error', () => {
        const data = { userId: 123 }
        remoteLogger.fatal('fatal message', data, testError)

        expect(mockLogger.fatal).toHaveBeenCalledWith({
          message: 'fatal message',
          data,
          error: testError,
        })
      })
    })
  })

  describe('report method', () => {
    it('should send incident report via lokiTransport', () => {
      const bifoldError = new (class extends Error {
        title = 'Test Error'
        description = 'Test error description'
        code = 1001
        constructor() {
          super('Test error message')
          this.name = 'BifoldError'
        }
      })()

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      remoteLogger.report(bifoldError as any)

      expect(mockLogger.info).toHaveBeenCalledWith({
        message: 'Sending Loki report',
      })

      expect(mockLokiTransport).toHaveBeenCalledWith({
        msg: 'Test Error',
        rawMsg: [
          {
            message: 'Test Error',
            data: {
              title: 'Test Error',
              description: 'Test error description',
              code: 1001,
              message: 'Test error message',
            },
          },
        ],
        level: { severity: 3, text: 'error' },
        options: {
          lokiUrl: defaultOptions.lokiUrl,
          lokiLabels: defaultOptions.lokiLabels,
          job: 'incident-report',
        },
      })
    })
  })
})
