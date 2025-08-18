import { IndyVdrPoolConfig } from '@credo-ts/indy-vdr'
import axios from 'axios'

const INDY_NETWORK_URL =
  'https://raw.githubusercontent.com/hyperledger/indy-node-monitor/main/fetch-validator-status/networks.json'

const ERROR_TAG = 'LEDGER ERROR'

export enum IndyLedger {
  SOVRIN_BUILDER_NET = 'sbn',
  SOVRIN_STAGING_NET = 'ssn',
  SOVERIN_MAIN_NET = 'smn',
  LOCAL_VON_NETWORK = 'vn',
  LINUX_LOCAL_VON_NETWORK = 'lln',
  BCOVRIN_DEV = 'bcd',
  BCOVRIN_TEST = 'bct',
  BCOVRIN = 'bcp',
  GREENLIGHT_DEV_LEDGER = 'gld',
  INDICO_MAINNET = 'imn',
  INDICO_DEMONET = 'idn',
  INDICO_TESTNET = 'itn',
  CANDY_DEV_NETWORK = 'cdn',
  CANDY_TEST_NETWORK = 'ctn',
  CANDY_PRODUCTION_NETWORK = 'cpn',
}

export interface IndyLedgerConfig {
  ledgerId: IndyLedger
  isProduction: boolean
  doNotConnectOnStartup?: true
}

export interface IndyLedgerJSON extends IndyVdrPoolConfig {
  // A human-readable identifier for the ledger, useful for identifing the ledger in the JSON file.
  // Note: This value will not be used downstream as the IndyVdrPoolConfig interface will exclude it.
  id: string
}

export type IndyLedgersRecord = Record<
  IndyLedger,
  {
    name: string
    indyNamespace: string
    genesisUrl: string
  }
>

// This interface allows us to abstract the file system operations,
// preventing android from complaining about the use of the Node.js module 'fs'.
export interface IndyLedgerFileSystem {
  /**
   * Writes data to a file at the specified file path.
   *
   * @param {string} filePath - The path to the file where data should be written.
   * @param {*} {string} data - The data to write to the file.
   * @returns {*} {void}
   */
  writeFile: (filePath: string, data: string) => void
  /**
   * Reads and returns the content of a file at the specified file path.
   *
   * @param {string} filePath - The path to the file to read.
   * @returns {*} {string} - The content of the file as a string.
   */
  readFile: (filePath: string) => string
  /**
   * Checks if a file exists at the specified file path.
   *
   * @param {string} filePath - The path to the file to check.
   * @returns {*} {boolean} - True if the file exists, false otherwise.
   */
  fileExists: (filePath: string) => boolean
  /**
   * Resolves and returns the absolute path for a given file path.
   *
   * @example ./ledgers.json -> /Users/username/project/ledgers.json
   *
   * @param {string} filePath - The file path to resolve.
   * @returns {*} {string} - The resolved absolute file path.
   */
  pathResolve: (filePath: string) => string
}

/**
 * Fetches the content from a given URL and returns it as a Promise.
 *
 * @throws {Error} - Throws an error if the fetch operation fails.
 * @template T - The type of content expected from the URL.
 * @param {string} url - The URL to fetch content from.
 * @returns {*} {Promise<T>} - A promise that resolves to the content fetched from the URL
 */
export async function _fetchUrlContent<T>(url: string): Promise<T> {
  try {
    const response = await axios.get<T>(url)
    return response.data
  } catch (error: any) {
    throw new Error(`${ERROR_TAG}: Failed to fetch content from URL ${url}: ${error.message}`)
  }
}

/**
 * Fetches and returns a list of Indy ledgers based on the provided configurations.
 *
 * @throws {Error} - Throws an error if a ledgerConfig is not found in the IndyLedgersRecord.
 * @param {IndyLedgerConfig[]} indyLedgerConfigs - The list of supported Indy ledger configurations.
 * @returns {*} {Promise<IndyLedgerJSON[]>} - A promise that resolves to an array of ledgers.
 */
export async function getIndyLedgers(indyLedgerConfigs: IndyLedgerConfig[]): Promise<IndyLedgerJSON[]> {
  if (!indyLedgerConfigs.length) {
    return []
  }

  const allIndyLedgers = await _fetchUrlContent<IndyLedgersRecord>(INDY_NETWORK_URL)

  const ledgers: IndyLedgerJSON[] = []
  // Iterate through the supported network configs and map them to the Indy ledgers
  for (const ledgerConfig of indyLedgerConfigs) {
    const indyLedger = allIndyLedgers[ledgerConfig.ledgerId]

    if (!indyLedger) {
      throw new Error(`${ERROR_TAG}: Ledger config for ${ledgerConfig.ledgerId} not found`)
    }

    const ledgerId = indyLedger.name
      .split(' ')
      .filter((word) => !/\W+/im.test(word))
      .join('')

    ledgers.push({
      id: ledgerId,
      indyNamespace: indyLedger.indyNamespace,
      isProduction: ledgerConfig.isProduction,
      connectOnStartup: !ledgerConfig.doNotConnectOnStartup,
      // This url will need to be fetched to get the genesis transactions
      genesisTransactions: indyLedger.genesisUrl,
    })
  }

  // Step 1: Collect all genesis transaction promises
  const genesisPromises = ledgers.map((ledger) => _fetchUrlContent<string>(ledger.genesisTransactions))

  // Step 2: Await all promises to resolve in parallel
  const genesisTransactions = await Promise.all(genesisPromises)

  // Step 3: Assign the fetched genesis transactions back to the ledgers
  genesisTransactions.forEach((transactions, index) => {
    ledgers[index].genesisTransactions = transactions.trim()
  })

  return ledgers
}

/**
 * Writes the provided Indy ledgers to a JSON file at the specified file path.
 *
 * @throws {Error} - Throws an error if writing to the file fails or if the file path is invalid.
 * @param {IndyLedgerFileSystem} fileSystem - The file system interface to use for writing the file.
 * @param {string} filePath - The path to the JSON file where the ledgers should be written.
 * @param {IndyLedgerJSON[]} ledgers - The array of Indy ledgers to write to the file.
 * @returns {*} {void}
 */
export function writeIndyLedgersToFile(
  fileSystem: IndyLedgerFileSystem,
  filePath: string,
  ledgers: IndyLedgerJSON[]
): void {
  try {
    if (!filePath.endsWith('.json')) {
      throw new Error('File path must point to a JSON file')
    }

    // Skip writing to file if the new ledgers are the same
    if (
      fileSystem.fileExists(filePath) &&
      JSON.stringify(readIndyLedgersFromFile(fileSystem, filePath)) === JSON.stringify(ledgers)
    ) {
      return
    }

    const jsonContent = JSON.stringify(ledgers, null, 2)

    // Convert to absolute path ie: ./ledgers.json -> /Users/username/project/ledgers.json
    const absoluteFilePath = fileSystem.pathResolve(filePath)
    fileSystem.writeFile(absoluteFilePath, jsonContent)
  } catch (error: any) {
    throw new Error(`${ERROR_TAG}: Failed to write ledgers to file ${filePath}: ${error.message}`)
  }
}

/**
 * Reads and parses Indy ledgers from a JSON file at the specified file path.
 *
 * @throws {Error} - Throws an error if reading from the file fails, if the file path is invalid, or if parsing fails.
 * @param {IndyLedgerFileSystem} fileSystem - The file system interface to use for reading the file.
 * @param {string} filePath - The path to the JSON file to read the ledgers from.
 * @returns {*} {IndyLedgerJSON[]} - An array of Indy ledgers read from the file.
 */
export function readIndyLedgersFromFile(fileSystem: IndyLedgerFileSystem, filePath: string): IndyLedgerJSON[] {
  try {
    if (!filePath.endsWith('.json')) {
      throw new Error('File path must point to a JSON file')
    }

    // Convert to absolute path ie: ./ledgers.json -> /Users/username/project/ledgers.json
    const absoluteFilePath = fileSystem.pathResolve(filePath)
    const jsonContent = fileSystem.readFile(absoluteFilePath)

    return JSON.parse(jsonContent)
  } catch (error: any) {
    throw new Error(`${ERROR_TAG}: Failed to read ledgers from file ${filePath}: ${error.message}`)
  }
}
