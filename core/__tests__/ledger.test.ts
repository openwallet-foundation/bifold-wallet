import { fetchLedgerNodes } from '../App/utils/ledger'

jest.mock('react-native/Libraries/EventEmitter/NativeEventEmitter')
jest.mock('../configs/ledgers/indy')

describe('Ledger utility', () => {
  test('The default ledger nodes are fetched', async () => {
    const results = fetchLedgerNodes()

    expect(results).toMatchSnapshot()
  })

  test('No nodes are returned for a faux ledger', async () => {
    const results = fetchLedgerNodes('SpringfieldNet')

    expect(results.length).toBe(0)
  })
})
