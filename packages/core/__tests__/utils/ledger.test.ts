import fs from 'fs'
import path from 'path'
import axios from 'axios'
import {
  getIndyLedgers,
  IndyLedger,
  IndyLedgerFileSystem,
  readIndyLedgersFromFile,
  writeIndyLedgersToFile,
} from '../../src/utils/ledger'

const INDY_LEDGER_RECORD = {
  smn: {
    name: 'Sovrin Main Net',
    indyNamespace: 'sovrin',
    genesisUrl: 'SovrinURL',
  },
  vn: {
    name: 'Local von-network',
    indyNamespace: 'local:dev-docker',
    genesisUrl: 'LocalVonNetworkURL',
  },
  'vn-linux': {
    name: 'Linux Local von-network',
    indyNamespace: 'local:dev-linux',
    genesisUrl: 'LinuxLocalVonNetworkURL',
  },
}

const fileSystem: IndyLedgerFileSystem = {
  writeFile: (filePath: string, data: string) => fs.writeFileSync(filePath, data, 'utf8'),
  readFile: (filePath: string) => fs.readFileSync(filePath, 'utf8'),
  fileExists: (filePath: string) => fs.existsSync(filePath),
  pathResolve: (filePath: string) => path.resolve(filePath),
}

jest.mock('axios')

describe('ledger utils', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getIndyLedgers', () => {
    it('should return an array of indy ledgers', async () => {
      const getMock = axios.get as jest.Mock

      getMock.mockResolvedValueOnce({ data: INDY_LEDGER_RECORD })
      getMock.mockResolvedValueOnce({ data: 'genesisDataA ' }) // intentional whitespace for trimming test
      getMock.mockResolvedValueOnce({ data: 'genesisDataB' })

      const ledgers = await getIndyLedgers([
        {
          ledgerId: IndyLedger.SOVERIN_MAIN_NET,
          isProduction: false,
        },
        {
          ledgerId: IndyLedger.LOCAL_VON_NETWORK,
          doNotConnectOnStartup: true,
          isProduction: true,
        },
      ])

      expect(getMock).toHaveBeenCalledTimes(3)

      expect(ledgers).toHaveLength(2)

      expect(ledgers[0]).toStrictEqual({
        id: 'SovrinMainNet',
        connectOnStartup: true,
        isProduction: false,
        indyNamespace: 'sovrin',
        genesisTransactions: 'genesisDataA',
      })

      expect(ledgers[1]).toStrictEqual({
        id: 'Local',
        connectOnStartup: false,
        isProduction: true,
        indyNamespace: 'local:dev-docker',
        genesisTransactions: 'genesisDataB',
      })
    })

    it('should return an empty array if no ledgers are provided', async () => {
      const ledgers = await getIndyLedgers([])
      expect(ledgers).toHaveLength(0)
    })

    it('should throw an error if a ledger is not found', async () => {
      const getMock = axios.get as jest.Mock

      getMock.mockResolvedValueOnce({ data: INDY_LEDGER_RECORD })

      await expect(
        getIndyLedgers([
          {
            ledgerId: 'non-existent-ledger' as IndyLedger,
            isProduction: false,
          },
        ])
      ).rejects.toThrow('Ledger config for non-existent-ledger not found')

      expect(getMock).toHaveBeenCalledTimes(1)
    })
  })

  describe('writeIndyLedgersToFile', () => {
    it('should write ledgers to a JSON file', () => {
      const filePath = './test-ledgers.json'

      writeIndyLedgersToFile(fileSystem, filePath, [
        {
          id: 'SovrinMainNet',
          isProduction: false,
          indyNamespace: 'sovrin',
          genesisTransactions: 'A',
        },
      ])

      const writtenContent = fs.readFileSync(filePath, 'utf8')
      expect(JSON.parse(writtenContent)).toStrictEqual([
        {
          id: 'SovrinMainNet',
          isProduction: false,
          indyNamespace: 'sovrin',
          genesisTransactions: 'A',
        },
      ])

      // Clean up
      fs.unlinkSync(filePath)

      expect(fs.existsSync(filePath)).toBe(false)
    })

    it('should throw an error if the file path is invalid', () => {
      expect(() => writeIndyLedgersToFile(fileSystem, './invalid-path/ledgers.txt', [])).toThrow(
        'File path must point to a JSON file'
      )
    })
  })

  describe('readIndyLedgersFromFile', () => {
    it('should read ledgers from a JSON file', () => {
      const filePath = './test-ledgers.json'
      fs.writeFileSync(
        filePath,
        JSON.stringify([
          {
            id: 'SovrinMainNet',
            isProduction: false,
            indyNamespace: 'sovrin',
            genesisTransactions: 'A',
          },
        ]),
        'utf8'
      )

      const readLedgers = readIndyLedgersFromFile(fileSystem, filePath)
      expect(readLedgers).toStrictEqual([
        {
          id: 'SovrinMainNet',
          isProduction: false,
          indyNamespace: 'sovrin',
          genesisTransactions: 'A',
        },
      ])

      // Clean up
      fs.unlinkSync(filePath)

      expect(fs.existsSync(filePath)).toBe(false)
    })

    it('should skip writing to file if the new ledgers are the same', () => {
      const filePath = './test-ledgers.json'
      const ledgers = [
        {
          id: 'SovrinMainNet',
          isProduction: false,
          indyNamespace: 'sovrin',
          genesisTransactions: 'A',
        },
      ]

      // Write initial ledgers
      writeIndyLedgersToFile(fileSystem, filePath, ledgers)

      // Read from file
      const readLedgers = readIndyLedgersFromFile(fileSystem, filePath)
      expect(readLedgers).toStrictEqual(ledgers)

      const initialStats = fs.statSync(filePath)

      // Attempt to write the same ledgers again
      writeIndyLedgersToFile(fileSystem, filePath, ledgers)

      const finalStats = fs.statSync(filePath)

      // Check that the modified time did not change
      expect(finalStats.mtime).toEqual(initialStats.mtime)

      // Check that the file was not modified
      const writtenContent = fs.readFileSync(filePath, 'utf8')
      expect(JSON.parse(writtenContent)).toStrictEqual(ledgers)

      // Clean up
      fs.unlinkSync(filePath)

      expect(fs.existsSync(filePath)).toBe(false)
    })

    it('should throw an error if the file path is invalid', () => {
      expect(() => readIndyLedgersFromFile(fileSystem, './invalid-path/ledgers.txt')).toThrow(
        'File path must point to a JSON file'
      )
    })

    it('should throw is malformed JSON is read', () => {
      const filePath = './test-ledgers.json'
      fs.writeFileSync(filePath, 'This is not JSON', 'utf8')

      try {
        readIndyLedgersFromFile(fileSystem, filePath)
        expect(true).toBe(false)
      } catch (error) {
        expect((error as Error).message).toContain('Failed to read ledgers from file')
      }

      // Clean up
      fs.unlinkSync(filePath)

      expect(fs.existsSync(filePath)).toBe(false)
    })
  })
})
