import fs from 'fs'
import { getIndyLedgers, INDY_LEDGER, readIndyLedgersFromFile, writeIndyLedgersToFile } from '../../src/utils/ledger'

const LEDGERS = [
  {
    id: 'TestLedger1',
    name: 'Test Ledger 1',
    isProduction: false,
    indyNamespace: 'test1',
    genesisTransactions: 'genesis1',
  },
  {
    id: 'TestLedger2',
    name: 'Test Ledger 2',
    isProduction: false,
    indyNamespace: 'test2',
    genesisTransactions: 'genesis2',
  },
]

describe('ledger utils', () => {
  describe('getIndyLedgers', () => {
    it('should return an array of indy ledgers', () => {
      const ledgers = getIndyLedgers([
        {
          ledgerId: INDY_LEDGER.BCOVRIN,
          connectOnStartup: true,
          isProduction: false,
        },
      ])
    })
  })

  describe('writeIndyLedgersToFile', () => {
    it('should write ledgers to a JSON file', () => {
      const filePath = './test-ledgers.json'

      writeIndyLedgersToFile(filePath, LEDGERS)

      const writtenContent = fs.readFileSync(filePath, 'utf8')
      expect(writtenContent).toBe(JSON.stringify(LEDGERS, null, 2))

      // Clean up
      fs.unlinkSync(filePath)

      expect(fs.existsSync(filePath)).toBe(false)
    })

    it('should throw an error if the file path is invalid', () => {
      expect(() => writeIndyLedgersToFile('./invalid-path/ledgers.txt', [])).toThrow(
        'File path must point to a JSON file'
      )
    })
  })

  describe('readIndyLedgersFromFile', () => {
    it('should read ledgers from a JSON file', () => {
      const filePath = './test-ledgers.json'
      fs.writeFileSync(filePath, JSON.stringify(LEDGERS, null, 2), 'utf8')

      const readLedgers = readIndyLedgersFromFile(filePath)
      expect(readLedgers).toEqual(LEDGERS)

      // Clean up
      fs.unlinkSync(filePath)

      expect(fs.existsSync(filePath)).toBe(false)
    })

    it('should throw an error if the file path is invalid', () => {
      expect(() => readIndyLedgersFromFile('./invalid-path/ledgers.txt')).toThrow('File path must point to a JSON file')
    })
  })
})
