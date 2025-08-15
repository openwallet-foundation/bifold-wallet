import fs from 'fs'
import axios from 'axios'
import { getIndyLedgers, IndyLedger, readIndyLedgersFromFile, writeIndyLedgersToFile } from '../../src/utils/ledger'

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
        id: 'Localvon-network',
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

      writeIndyLedgersToFile(filePath, [
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
      expect(() => writeIndyLedgersToFile('./invalid-path/ledgers.txt', [])).toThrow(
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

      const readLedgers = readIndyLedgersFromFile(filePath)
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

    it('should throw an error if the file path is invalid', () => {
      expect(() => readIndyLedgersFromFile('./invalid-path/ledgers.txt')).toThrow('File path must point to a JSON file')
    })

    it('should throw is malformed JSON is read', () => {
      const filePath = './test-ledgers.json'
      fs.writeFileSync(filePath, 'This is not JSON', 'utf8')

      try {
        readIndyLedgersFromFile(filePath)
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
