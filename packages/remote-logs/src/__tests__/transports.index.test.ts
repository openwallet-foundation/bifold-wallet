import * as transports from '../transports'
import { consoleTransport } from '../transports/console'
import { lokiTransport } from '../transports/loki'

describe('transports index', () => {
  it('should export consoleTransport', () => {
    expect(transports.consoleTransport).toBeDefined()
    expect(transports.consoleTransport).toBe(consoleTransport)
  })

  it('should export lokiTransport', () => {
    expect(transports.lokiTransport).toBeDefined()
    expect(transports.lokiTransport).toBe(lokiTransport)
  })

  it('should export transport types', () => {
    // These should be available for import
    expect(typeof transports.consoleTransport).toBe('function')
    expect(typeof transports.lokiTransport).toBe('function')
  })
})
