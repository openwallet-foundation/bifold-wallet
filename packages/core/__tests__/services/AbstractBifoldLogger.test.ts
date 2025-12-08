import { AbstractBifoldLogger } from '../../src/services/AbstractBifoldLogger'
import { BifoldError } from '../../src/types/error'

// Concrete implementation for testing
class TestBifoldLogger extends AbstractBifoldLogger {
  public mockLog = {
    test: jest.fn(),
    trace: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    fatal: jest.fn(),
  }

  constructor() {
    super()
    this._log = this.mockLog
  }

  public report(bifoldError: BifoldError): void {
    // Mock implementation for testing
    this.error('BifoldError reported', { error: bifoldError })
  }
}

describe('AbstractBifoldLogger', () => {
  let logger: TestBifoldLogger

  beforeEach(() => {
    logger = new TestBifoldLogger()
    jest.clearAllMocks()
  })

  describe('Basic logging methods', () => {
    it('should call test method with message only', () => {
      const message = 'Test message'
      logger.test(message)

      expect(logger.mockLog.test).toHaveBeenCalledWith({ message, data: undefined })
    })

    it('should call test method with message and data', () => {
      const message = 'Test message'
      const data = { key: 'value' }
      logger.test(message, data)

      expect(logger.mockLog.test).toHaveBeenCalledWith({ message, data })
    })

    it('should call trace method with message only', () => {
      const message = 'Trace message'
      logger.trace(message)

      expect(logger.mockLog.trace).toHaveBeenCalledWith({ message, data: undefined })
    })

    it('should call trace method with message and data', () => {
      const message = 'Trace message'
      const data = { traceId: '123' }
      logger.trace(message, data)

      expect(logger.mockLog.trace).toHaveBeenCalledWith({ message, data })
    })

    it('should call debug method with message only', () => {
      const message = 'Debug message'
      logger.debug(message)

      expect(logger.mockLog.debug).toHaveBeenCalledWith({ message, data: undefined })
    })

    it('should call debug method with message and data', () => {
      const message = 'Debug message'
      const data = { debugLevel: 2 }
      logger.debug(message, data)

      expect(logger.mockLog.debug).toHaveBeenCalledWith({ message, data })
    })

    it('should call info method with message only', () => {
      const message = 'Info message'
      logger.info(message)

      expect(logger.mockLog.info).toHaveBeenCalledWith({ message, data: undefined })
    })

    it('should call info method with message and data', () => {
      const message = 'Info message'
      const data = { userId: 'user123' }
      logger.info(message, data)

      expect(logger.mockLog.info).toHaveBeenCalledWith({ message, data })
    })

    it('should call warn method with message only', () => {
      const message = 'Warning message'
      logger.warn(message)

      expect(logger.mockLog.warn).toHaveBeenCalledWith({ message, data: undefined })
    })

    it('should call warn method with message and data', () => {
      const message = 'Warning message'
      const data = { warningCode: 'W001' }
      logger.warn(message, data)

      expect(logger.mockLog.warn).toHaveBeenCalledWith({ message, data })
    })
  })

  describe('Error method overloads', () => {
    it('should call error method with message only', () => {
      const message = 'Error message'
      logger.error(message)

      expect(logger.mockLog.error).toHaveBeenCalledWith({
        message,
        data: undefined,
        error: undefined,
      })
    })

    it('should call error method with message and data', () => {
      const message = 'Error message'
      const data = { errorCode: 'E001' }
      logger.error(message, data)

      expect(logger.mockLog.error).toHaveBeenCalledWith({
        message,
        data,
        error: undefined,
      })
    })

    it('should call error method with message and error', () => {
      const message = 'Error message'
      const error = new Error('Test error')
      logger.error(message, error)

      expect(logger.mockLog.error).toHaveBeenCalledWith({
        message,
        data: undefined,
        error,
      })
    })

    it('should call error method with message, data, and error', () => {
      const message = 'Error message'
      const data = { errorCode: 'E001' }
      const error = new Error('Test error')
      logger.error(message, data, error)

      expect(logger.mockLog.error).toHaveBeenCalledWith({
        message,
        data,
        error,
      })
    })
  })

  describe('Fatal method overloads', () => {
    it('should call fatal method with message only', () => {
      const message = 'Fatal message'
      logger.fatal(message)

      expect(logger.mockLog.fatal).toHaveBeenCalledWith({
        message,
        data: undefined,
        error: undefined,
      })
    })

    it('should call fatal method with message and data', () => {
      const message = 'Fatal message'
      const data = { fatalCode: 'F001' }
      logger.fatal(message, data)

      expect(logger.mockLog.fatal).toHaveBeenCalledWith({
        message,
        data,
        error: undefined,
      })
    })

    it('should call fatal method with message and error', () => {
      const message = 'Fatal message'
      const error = new Error('Fatal error')
      logger.fatal(message, error)

      expect(logger.mockLog.fatal).toHaveBeenCalledWith({
        message,
        data: undefined,
        error,
      })
    })

    it('should call fatal method with message, data, and error', () => {
      const message = 'Fatal message'
      const data = { fatalCode: 'F001' }
      const error = new Error('Fatal error')
      logger.fatal(message, data, error)

      expect(logger.mockLog.fatal).toHaveBeenCalledWith({
        message,
        data,
        error,
      })
    })
  })

  describe('Configuration', () => {
    it('should have default configuration values', () => {
      expect(logger['_config']).toEqual({
        levels: {
          test: 0,
          trace: 0,
          debug: 0,
          info: 1,
          warn: 2,
          error: 3,
          fatal: 4,
        },
        severity: 'debug',
        async: true,
        dateFormat: 'time',
        printDate: false,
      })
    })
  })

  describe('When _log is undefined', () => {
    let loggerWithoutLog: TestBifoldLogger

    beforeEach(() => {
      loggerWithoutLog = new TestBifoldLogger()
      loggerWithoutLog['_log'] = undefined
    })

    it('should not throw when calling test method with undefined _log', () => {
      expect(() => {
        loggerWithoutLog.test('Test message')
      }).not.toThrow()
    })

    it('should not throw when calling trace method with undefined _log', () => {
      expect(() => {
        loggerWithoutLog.trace('Trace message')
      }).not.toThrow()
    })

    it('should not throw when calling debug method with undefined _log', () => {
      expect(() => {
        loggerWithoutLog.debug('Debug message')
      }).not.toThrow()
    })

    it('should not throw when calling info method with undefined _log', () => {
      expect(() => {
        loggerWithoutLog.info('Info message')
      }).not.toThrow()
    })

    it('should not throw when calling warn method with undefined _log', () => {
      expect(() => {
        loggerWithoutLog.warn('Warning message')
      }).not.toThrow()
    })

    it('should not throw when calling error method with undefined _log', () => {
      expect(() => {
        loggerWithoutLog.error('Error message')
      }).not.toThrow()
    })

    it('should not throw when calling fatal method with undefined _log', () => {
      expect(() => {
        loggerWithoutLog.fatal('Fatal message')
      }).not.toThrow()
    })
  })

  describe('Abstract method implementation', () => {
    it('should implement report method', () => {
      const bifoldError = new BifoldError('Test Error Title', 'Test error description', 'Test error message', 1001)

      logger.report(bifoldError)

      expect(logger.mockLog.error).toHaveBeenCalledWith({
        message: 'BifoldError reported',
        data: { error: bifoldError },
        error: undefined,
      })
    })
  })

  describe('Type validation for error and fatal methods', () => {
    it('should correctly identify Error instance in error method', () => {
      const message = 'Test message'
      const error = new Error('Test error')
      const customError = new TypeError('Type error')

      logger.error(message, error)
      expect(logger.mockLog.error).toHaveBeenLastCalledWith({
        message,
        data: undefined,
        error,
      })

      logger.error(message, customError)
      expect(logger.mockLog.error).toHaveBeenLastCalledWith({
        message,
        data: undefined,
        error: customError,
      })
    })

    it('should correctly identify Error instance in fatal method', () => {
      const message = 'Test message'
      const error = new Error('Test error')
      const customError = new RangeError('Range error')

      logger.fatal(message, error)
      expect(logger.mockLog.fatal).toHaveBeenLastCalledWith({
        message,
        data: undefined,
        error,
      })

      logger.fatal(message, customError)
      expect(logger.mockLog.fatal).toHaveBeenLastCalledWith({
        message,
        data: undefined,
        error: customError,
      })
    })

    it('should handle complex data objects correctly', () => {
      const message = 'Complex data test'
      const complexData = {
        user: { id: 1, name: 'John' },
        metadata: { timestamp: Date.now(), version: '1.0' },
        flags: [true, false, true],
      }

      logger.info(message, complexData)
      expect(logger.mockLog.info).toHaveBeenCalledWith({
        message,
        data: complexData,
      })
    })
  })
})
