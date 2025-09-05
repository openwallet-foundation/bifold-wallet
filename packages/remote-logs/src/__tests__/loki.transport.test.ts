import axios from 'axios'
import { Buffer } from 'buffer'

import { lokiTransport, LokiTransportProps } from '../transports/loki'

// Mock axios
jest.mock('axios')
const mockAxios = axios as jest.Mocked<typeof axios>

// Mock Buffer
jest.mock('buffer', () => ({
  Buffer: {
    from: jest.fn().mockReturnValue({
      toString: jest.fn().mockReturnValue('dGVzdDp0ZXN0'),
    }),
  },
}))

describe('lokiTransport', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockAxios.post.mockResolvedValue({ status: 204 })
  })

  const createMockProps = (overrides: Partial<LokiTransportProps> = {}): LokiTransportProps => ({
    msg: 'test message',
    rawMsg: [{ message: 'test message', data: { userId: 123 } }],
    level: {
      severity: 1,
      text: 'info',
    },
    options: {
      lokiUrl: 'https://user:pass@loki.example.com/loki/api/v1/push',
      lokiLabels: { app: 'test-app', env: 'test' },
      job: 'test-job',
    },
    ...overrides,
  })

  describe('basic functionality', () => {
    it('should send log to Loki successfully', async () => {
      const props = createMockProps()

      lokiTransport(props)

      expect(mockAxios.post).toHaveBeenCalledWith(
        'https://loki.example.com/loki/api/v1/push',
        expect.objectContaining({
          streams: expect.arrayContaining([
            expect.objectContaining({
              stream: {
                job: 'test-job',
                level: 'info',
                app: 'test-app',
                env: 'test',
              },
              values: expect.arrayContaining([
                expect.arrayContaining([
                  expect.stringMatching(/^\d{13}000000$/), // Timestamp with nanosecond padding
                  '{"message":"test message","data":{"userId":123}}',
                ]),
              ]),
            }),
          ]),
        }),
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Basic dGVzdDp0ZXN0',
          },
        }
      )
    })

    it('should use default job when not provided', () => {
      const props = createMockProps({
        options: {
          lokiUrl: 'https://user:pass@loki.example.com/loki/api/v1/push',
          lokiLabels: { app: 'test-app' },
        },
      })

      lokiTransport(props)

      expect(mockAxios.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          streams: expect.arrayContaining([
            expect.objectContaining({
              stream: expect.objectContaining({
                job: 'react-native-logs',
              }),
            }),
          ]),
        }),
        expect.any(Object)
      )
    })
  })

  describe('URL parsing', () => {
    it('should parse Loki URL with credentials correctly', () => {
      const props = createMockProps({
        options: {
          lokiUrl: 'https://myuser:mypass@loki.internal.com/loki/api/v1/push',
          lokiLabels: { app: 'test' },
        },
      })

      lokiTransport(props)

      expect(mockAxios.post).toHaveBeenCalledWith(
        'https://loki.internal.com/loki/api/v1/push',
        expect.any(Object),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Basic dGVzdDp0ZXN0', // Mocked base64 encoded credentials
          }),
        })
      )
    })

    it('should handle different protocols', () => {
      const props = createMockProps({
        options: {
          lokiUrl: 'http://user:pass@localhost:3100/loki/api/v1/push',
          lokiLabels: { app: 'test' },
        },
      })

      lokiTransport(props)

      expect(mockAxios.post).toHaveBeenCalledWith(
        'http://localhost:3100/loki/api/v1/push',
        expect.any(Object),
        expect.any(Object)
      )
    })
  })

  describe('timestamp generation', () => {
    it('should generate timestamp with nanosecond precision', () => {
      const originalDateNow = Date.now
      Date.now = jest.fn().mockReturnValue(1234567890123)

      const props = createMockProps()
      lokiTransport(props)

      expect(mockAxios.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          streams: expect.arrayContaining([
            expect.objectContaining({
              values: expect.arrayContaining([
                expect.arrayContaining([
                  '1234567890123000000', // Timestamp with nanosecond padding
                  expect.any(String),
                ]),
              ]),
            }),
          ]),
        }),
        expect.any(Object)
      )

      Date.now = originalDateNow
    })
  })

  describe('data serialization', () => {
    it('should serialize complex data correctly', () => {
      const complexData = {
        user: { id: 123, name: 'John' },
        action: 'login',
        metadata: { timestamp: '2023-01-01', version: '1.0' },
      }

      const props = createMockProps({
        rawMsg: [{ message: 'User login', data: complexData }],
      })

      lokiTransport(props)

      expect(mockAxios.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          streams: expect.arrayContaining([
            expect.objectContaining({
              values: expect.arrayContaining([
                expect.arrayContaining([
                  expect.any(String),
                  JSON.stringify({ message: 'User login', data: complexData }),
                ]),
              ]),
            }),
          ]),
        }),
        expect.any(Object)
      )
    })

    it('should handle null and undefined data', () => {
      const props = createMockProps({
        rawMsg: [{ message: 'Simple log', data: null }],
      })

      lokiTransport(props)

      expect(mockAxios.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          streams: expect.arrayContaining([
            expect.objectContaining({
              values: expect.arrayContaining([
                expect.arrayContaining([expect.any(String), '{"message":"Simple log","data":null}']),
              ]),
            }),
          ]),
        }),
        expect.any(Object)
      )
    })
  })

  describe('error handling', () => {
    it('should throw error when options is missing', () => {
      const props = createMockProps({
        options: undefined,
      })

      expect(() => lokiTransport(props)).toThrow('props.options is required')
    })

    it('should throw error when lokiUrl is missing', () => {
      const props = createMockProps({
        options: {
          lokiLabels: { app: 'test' },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any,
      })

      expect(() => lokiTransport(props)).toThrow('props.options.lokiUrl is required')
    })

    it('should throw error when lokiLabels is missing', () => {
      const props = createMockProps({
        options: {
          lokiUrl: 'https://user:pass@loki.example.com/loki/api/v1/push',
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any,
      })

      expect(() => lokiTransport(props)).toThrow('props.options.labels is required')
    })

    it('should handle axios network errors gracefully', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
      mockAxios.post.mockRejectedValue(new Error('Network error'))

      const props = createMockProps()

      // Should not throw
      expect(() => lokiTransport(props)).not.toThrow()

      // Wait for async operation
      await new Promise((resolve) => setTimeout(resolve, 0))

      expect(consoleErrorSpy).toHaveBeenCalledWith('Error while sending to Loki, Error: Network error')

      consoleErrorSpy.mockRestore()
    })

    it('should warn on unexpected HTTP status', async () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation()
      mockAxios.post.mockResolvedValue({ status: 500 })

      const props = createMockProps()
      lokiTransport(props)

      // Wait for async operation
      await new Promise((resolve) => setTimeout(resolve, 0))

      expect(consoleWarnSpy).toHaveBeenCalledWith('Expected Loki to return 204, received 500')

      consoleWarnSpy.mockRestore()
    })
  })

  describe('authentication', () => {
    it('should create correct basic auth header', () => {
      const mockBuffer = Buffer.from as jest.Mock
      mockBuffer.mockReturnValue({
        toString: jest.fn().mockReturnValue('dXNlcjpwYXNz'),
      })

      const props = createMockProps({
        options: {
          lokiUrl: 'https://user:pass@loki.example.com/loki/api/v1/push',
          lokiLabels: { app: 'test' },
        },
      })

      lokiTransport(props)

      expect(mockBuffer).toHaveBeenCalledWith('user:pass')
      expect(mockAxios.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Object),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Basic dXNlcjpwYXNz',
          }),
        })
      )
    })
  })

  describe('labels configuration', () => {
    it('should merge custom labels with default fields', () => {
      const props = createMockProps({
        options: {
          lokiUrl: 'https://user:pass@loki.example.com/loki/api/v1/push',
          lokiLabels: {
            app: 'my-app',
            env: 'production',
            version: '1.2.3',
            custom: 'value',
          },
          job: 'custom-job',
        },
      })

      lokiTransport(props)

      expect(mockAxios.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          streams: expect.arrayContaining([
            expect.objectContaining({
              stream: {
                job: 'custom-job',
                level: 'info',
                app: 'my-app',
                env: 'production',
                version: '1.2.3',
                custom: 'value',
              },
            }),
          ]),
        }),
        expect.any(Object)
      )
    })

    it('should handle empty labels object', () => {
      const props = createMockProps({
        options: {
          lokiUrl: 'https://user:pass@loki.example.com/loki/api/v1/push',
          lokiLabels: {},
        },
      })

      lokiTransport(props)

      expect(mockAxios.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          streams: expect.arrayContaining([
            expect.objectContaining({
              stream: {
                job: 'react-native-logs',
                level: 'info',
              },
            }),
          ]),
        }),
        expect.any(Object)
      )
    })
  })
})
