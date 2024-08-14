import { canConnectToLedgerNode } from '../App/utils/ledger'

jest.mock('react-native/Libraries/EventEmitter/NativeEventEmitter')
jest.mock('../App/configs/ledgers/indy')
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
  test('An available host returns "true"', async () => {
    const result = await canConnectToLedgerNode({ host: '192.168.100.1', port: ports.connect })

    expect(result).toBe(true)
  })

  test('An un-available host returns times out', async () => {
    const result = canConnectToLedgerNode({ host: '192.168.100.1', port: ports.timeout })

    await expect(result).rejects.toThrow('Timeout opening connection to ledger node')
  })

  test('An bad host returns errors out', async () => {
    const result = canConnectToLedgerNode({ host: '192.168.100.1', port: ports.error })

    await expect(result).rejects.toThrow('Error opening connection to ledger node')
  })
})
