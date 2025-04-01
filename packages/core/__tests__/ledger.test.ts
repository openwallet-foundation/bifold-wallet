import { canConnectToHost, fetchLedgerNodes } from '../src/utils/network'

jest.mock('react-native/Libraries/EventEmitter/NativeEventEmitter')
jest.mock('../src/configs/ledgers/indy')
jest.useFakeTimers({ legacyFakeTimers: true })
jest.spyOn(global, 'setTimeout')

// Use these ports to trigger TCP socket behaviour in the
// mock.
const ports = {
  connect: 8001,
  error: 8002,
  timeout: 8003,
}

describe('Ledger utility', () => {
  test('The default ledger nodes are fetched', async () => {
    const results = fetchLedgerNodes()

    expect(results).toMatchSnapshot()
  })

  test('No nodes are returned for a faux ledger', async () => {
    const results = fetchLedgerNodes('springfield')

    expect(results).toHaveLength(0)
  })

  test('An available host returns "true"', async () => {
    const result = await canConnectToHost({ host: '192.168.100.1', port: ports.connect })

    expect(result).toBe(true)
  })

  test('An un-available host returns "false"', async () => {
    const result = await canConnectToHost({ host: '192.168.100.1', port: ports.timeout })

    expect(result).toBe(false)
  })

  test('An bad host returns "false"', async () => {
    const result = await canConnectToHost({ host: '192.168.100.1', port: ports.error })

    expect(result).toBe(false)
  })
})
