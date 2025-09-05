import { consoleTransport, ConsoleTransportProps } from '../transports/console'

describe('consoleTransport', () => {
  // Mock console.log to capture output
  const mockConsoleLog = jest.fn()

  beforeAll(() => {
    // Store original console.log for cleanup
    global.console.log = mockConsoleLog
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  // Test helper function with clear parameter types
  const createMockProps = (overrides: Partial<ConsoleTransportProps> = {}): ConsoleTransportProps => ({
    msg: 'test message',
    rawMsg: [{ message: 'test message' }],
    level: {
      severity: 1,
      text: 'info',
    },
    extension: null,
    options: undefined,
    ...overrides,
  })

  describe('basic functionality', () => {
    it('should log a simple message', () => {
      const props = createMockProps()

      consoleTransport(props)

      expect(mockConsoleLog).toHaveBeenCalledWith('test message')
    })

    it('should return early if props is falsy', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      consoleTransport(null as any)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      consoleTransport(undefined as any)

      expect(mockConsoleLog).not.toHaveBeenCalled()
    })

    it('should handle message with additional data', () => {
      const props = createMockProps({
        rawMsg: [{ message: 'test message', data: { userId: 123, action: 'login' } }],
      })

      consoleTransport(props)

      expect(mockConsoleLog).toHaveBeenCalledWith('test message {\n  "userId": 123,\n  "action": "login"\n}')
    })

    it('should handle message with no additional data', () => {
      const props = createMockProps({
        rawMsg: [{ message: 'test message' }],
      })

      consoleTransport(props)

      expect(mockConsoleLog).toHaveBeenCalledWith('test message')
    })
  })

  describe('data formatting', () => {
    it('should format Error objects properly', () => {
      const error = new Error('Test error')
      error.stack = 'Error: Test error\n    at Object.<anonymous> (/path/to/file.js:1:1)'

      const props = createMockProps({
        rawMsg: [{ message: 'Error occurred', error }],
      })

      consoleTransport(props)

      const loggedMessage = mockConsoleLog.mock.calls[0][0]
      expect(loggedMessage).toContain('Error occurred')
      expect(loggedMessage).toContain('"name": "Error"')
      expect(loggedMessage).toContain('"message": "Test error"')
      expect(loggedMessage).toContain('"stack"')
    })

    it('should format complex objects as JSON', () => {
      const complexData = {
        user: { id: 123, name: 'John' },
        settings: { theme: 'dark', notifications: true },
      }

      const props = createMockProps({
        rawMsg: [{ message: 'User action', data: complexData }],
      })

      consoleTransport(props)

      const loggedMessage = mockConsoleLog.mock.calls[0][0]
      expect(loggedMessage).toContain('User action')
      expect(loggedMessage).toContain('"user"')
      expect(loggedMessage).toContain('"settings"')
      expect(loggedMessage).toContain('"theme": "dark"')
    })

    it('should handle primitive values', () => {
      const props = createMockProps({
        rawMsg: [{ message: 'Count updated', count: 42, active: true }],
      })

      consoleTransport(props)

      const loggedMessage = mockConsoleLog.mock.calls[0][0]
      expect(loggedMessage).toContain('Count updated')
      expect(loggedMessage).toContain('42')
      expect(loggedMessage).toContain('true')
    })

    it('should handle multiple data properties', () => {
      const props = createMockProps({
        rawMsg: [
          {
            message: 'Multiple data',
            userId: 123,
            sessionId: 'abc-123',
            metadata: { version: '1.0' },
          },
        ],
      })

      consoleTransport(props)

      const loggedMessage = mockConsoleLog.mock.calls[0][0]
      expect(loggedMessage).toContain('Multiple data')
      expect(loggedMessage).toContain('123')
      expect(loggedMessage).toContain('abc-123')
      expect(loggedMessage).toContain('"version": "1.0"')
    })
  })

  describe('color formatting', () => {
    it('should apply colors when configured', () => {
      const props = createMockProps({
        options: {
          colors: {
            info: 'blue',
            error: 'red',
          },
        },
      })

      consoleTransport(props)

      const loggedMessage = mockConsoleLog.mock.calls[0][0]
      expect(loggedMessage).toContain('\x1b[34m') // Blue color code
      expect(loggedMessage).toContain('\x1b[0m') // Reset color code
      expect(loggedMessage).toContain('test message')
    })

    it('should not apply colors when level not configured', () => {
      const props = createMockProps({
        level: { severity: 2, text: 'warn' },
        options: {
          colors: {
            info: 'blue',
            error: 'red',
          },
        },
      })

      consoleTransport(props)

      const loggedMessage = mockConsoleLog.mock.calls[0][0]
      expect(loggedMessage).not.toContain('\x1b[')
      expect(loggedMessage).toBe('test message')
    })

    it('should handle invalid color configurations', () => {
      const props = createMockProps({
        options: {
          colors: {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            info: 'invalidColor' as any,
          },
        },
      })

      consoleTransport(props)

      const loggedMessage = mockConsoleLog.mock.calls[0][0]
      expect(loggedMessage).toBe('test message')
    })
  })

  describe('extension colors', () => {
    it('should apply extension colors when configured', () => {
      const props = createMockProps({
        rawMsg: [{ message: 'test module-name message' }],
        extension: 'module-name',
        options: {
          extensionColors: {
            'module-name': 'green',
          },
        },
      })

      consoleTransport(props)

      const loggedMessage = mockConsoleLog.mock.calls[0][0]
      expect(loggedMessage).toContain('\x1b[42m') // Green background color code
      expect(loggedMessage).toContain(' module-name ')
    })

    it('should use default extension color when not configured', () => {
      const props = createMockProps({
        rawMsg: [{ message: 'test module-name message' }],
        extension: 'module-name',
        options: {
          extensionColors: {},
        },
      })

      consoleTransport(props)

      const loggedMessage = mockConsoleLog.mock.calls[0][0]
      expect(loggedMessage).toContain('\x1b[7m') // Reverse video (default)
      expect(loggedMessage).toContain(' module-name ')
    })

    it('should combine message colors and extension colors', () => {
      const props = createMockProps({
        rawMsg: [{ message: 'test module-name message' }],
        extension: 'module-name',
        options: {
          colors: {
            info: 'blue',
          },
          extensionColors: {
            'module-name': 'green',
          },
        },
      })

      consoleTransport(props)

      const loggedMessage = mockConsoleLog.mock.calls[0][0]
      expect(loggedMessage).toContain('\x1b[34m') // Blue message color
      expect(loggedMessage).toContain('\x1b[42m') // Green extension background
      expect(loggedMessage).toContain(' module-name ')
    })
  })

  describe('custom console function', () => {
    it('should use custom console function when provided', () => {
      const customConsoleFunc = jest.fn()
      const props = createMockProps({
        options: {
          consoleFunc: customConsoleFunc,
        },
      })

      consoleTransport(props)

      expect(customConsoleFunc).toHaveBeenCalledWith('test message')
      expect(mockConsoleLog).not.toHaveBeenCalled()
    })

    it('should use custom console function with formatted data', () => {
      const customConsoleFunc = jest.fn()
      const props = createMockProps({
        rawMsg: [{ message: 'test message', data: { key: 'value' } }],
        options: {
          consoleFunc: customConsoleFunc,
        },
      })

      consoleTransport(props)

      expect(customConsoleFunc).toHaveBeenCalledWith('test message {\n  "key": "value"\n}')
      expect(mockConsoleLog).not.toHaveBeenCalled()
    })
  })

  describe('edge cases', () => {
    it('should handle empty rawMsg array', () => {
      const props = createMockProps({
        rawMsg: [],
      })

      expect(() => consoleTransport(props)).not.toThrow()
    })

    it('should handle null extension', () => {
      const props = createMockProps({
        extension: null,
        options: {
          extensionColors: {
            'some-extension': 'blue',
          },
        },
      })

      consoleTransport(props)

      expect(mockConsoleLog).toHaveBeenCalledWith('test message')
    })

    it('should handle undefined extension', () => {
      const props = createMockProps({
        extension: undefined,
        options: {
          extensionColors: {
            'some-extension': 'blue',
          },
        },
      })

      consoleTransport(props)

      expect(mockConsoleLog).toHaveBeenCalledWith('test message')
    })

    it('should trim whitespace from messages', () => {
      const props = createMockProps({
        rawMsg: [{ message: '  test message with spaces  ' }],
      })

      consoleTransport(props)

      expect(mockConsoleLog).toHaveBeenCalledWith('test message with spaces')
    })

    it('should handle circular references in objects', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const circularObj: any = { name: 'test' }
      circularObj.self = circularObj

      const props = createMockProps({
        rawMsg: [{ message: 'circular test', data: circularObj }],
      })

      // Should not throw an error and should log the circular reference message
      expect(() => consoleTransport(props)).not.toThrow()
      expect(mockConsoleLog).toHaveBeenCalledWith(expect.stringContaining('[Circular Reference]'))
    })

    it('should handle JSON serialization errors gracefully', () => {
      // Create an object that will cause a JSON serialization error
      const problematicObj = {
        toJSON: () => {
          throw new TypeError('Custom serialization error')
        },
      }

      const props = createMockProps({
        rawMsg: [{ message: 'error test', data: problematicObj }],
      })

      // Should not throw an error and should log the serialization error message
      expect(() => consoleTransport(props)).not.toThrow()
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('[Serialization Error: Custom serialization error]')
      )
    })
  })
})
