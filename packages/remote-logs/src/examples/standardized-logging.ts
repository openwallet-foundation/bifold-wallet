/**
 * Usage examples demonstrating the standardized logging interface
 *
 * All logging methods now support consistent overload signatures:
 * - method(message)
 * - method(message, data)
 * - method(message, error)
 * - method(message, data, error)
 */

import { RemoteLogger } from '../logger'

// Example usage of the standardized logging interface
export function demonstrateStandardizedLogging() {
  const logger = new RemoteLogger({
    lokiUrl: 'https://user:pass@loki.example.com',
    lokiLabels: { app: 'my-wallet', version: '1.0.0' },
  })

  // All logging levels support the same consistent interface:

  // 1. Simple message logging
  logger.info('User logged in successfully')
  logger.error('Authentication failed')
  logger.debug('Processing credential offer')

  // 2. Message with contextual data
  logger.info('Credential received', {
    credentialType: 'driver_license',
    issuer: 'dmv.gov',
  })
  logger.warn('Rate limit approaching', {
    current: 45,
    limit: 50,
    timeWindow: '1min',
  })

  // 3. Message with error object
  const networkError = new Error('Connection timeout')
  logger.error('Failed to connect to issuer', networkError)
  logger.fatal('Critical system failure', networkError)

  // 4. Message with both data and error
  const validationError = new Error('Invalid credential format')
  logger.error(
    'Credential validation failed',
    {
      credentialId: 'cred-123',
      validationStep: 'signature_check',
      userId: 'user-456',
    },
    validationError
  )

  // All methods work identically - no more inconsistent APIs!
  logger.trace('Debug trace', { step: 1 })
  logger.test('Test execution', { testId: 'auth-001' }, new Error('Test failed'))
}

/**
 * TypeScript Interface Benefits:
 *
 * 1. Consistent API across all log levels
 * 2. Proper type checking for all parameters
 * 3. IntelliSense support for all overloads
 * 4. No more confusion about which methods support which parameters
 *
 * Before: Only error() and fatal() had overloads
 * After:  ALL methods (test, trace, debug, info, warn, error, fatal) have identical overloads
 */

// Type-safe usage examples:
export function typeScriptBenefits(logger: RemoteLogger) {
  // ✅ All of these compile correctly with full type safety:

  logger.debug('Simple message')
  logger.debug('Message with data', { userId: '123' })
  logger.debug('Message with error', new Error('Debug error'))
  logger.debug('Complete log', { context: 'auth' }, new Error('Debug with context'))

  logger.info('Simple message')
  logger.info('Message with data', { action: 'login' })
  logger.info('Message with error', new Error('Info error'))
  logger.info('Complete log', { sessionId: 'sess-123' }, new Error('Info with context'))

  // ❌ TypeScript will catch these errors:
  // logger.debug(123)  // Error: message must be string
  // logger.info('msg', 'invalid')  // Error: second param must be object or Error
  // logger.error('msg', { data: true }, 'not-error')  // Error: third param must be Error
}
