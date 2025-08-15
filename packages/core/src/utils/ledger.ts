import { IndyVdrPoolConfig } from '@credo-ts/indy-vdr'
import axios from 'axios'
import fs from 'fs'
import path from 'path'

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

interface IndyLedgerConfig {
  ledgerId: IndyLedger
  isProduction: boolean
  doNotConnectOnStartup?: true
}

interface IndyLedgerJSON extends IndyVdrPoolConfig {
  // A human-readable identifier for the ledger, useful for identifing the ledger in the JSON file.
  // Note: This value will not be used downstream as the IndyVdrPoolConfig interface will exclude it.
  id: string
}

type IndyLedgersRecord = Record<
  IndyLedger,
  {
    name: string
    indyNamespace: string
    genesisUrl: string
  }
>

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
  // Iterate through the supported networks and map them to the Indy ledgers
  for (const ledgerConfig of indyLedgerConfigs) {
    const indyLedger = allIndyLedgers[ledgerConfig.ledgerId]

    if (!indyLedger) {
      throw new Error(`${ERROR_TAG}: Ledger config for ${ledgerConfig.ledgerId} not found`)
    }

    ledgers.push({
      // Remove all whitespace to form the ledger ID
      id: indyLedger.name.replace(/\s+/g, ''),
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
 * @param {string} filePath - The path to the JSON file where the ledgers should be written.
 * @param {IndyLedgerJSON[]} ledgers - The array of Indy ledgers to write to the file.
 * @returns {*} {void}
 */
export function writeIndyLedgersToFile(filePath: string, ledgers: IndyLedgerJSON[]): void {
  try {
    if (!filePath.endsWith('.json')) {
      throw new Error('File path must point to a JSON file')
    }

    const jsonContent = JSON.stringify(ledgers, null, 2)

    // Convert to absolute path ie: ./ledgers.json -> /Users/username/project/ledgers.json
    const absoluteFilePath = path.resolve(filePath)
    fs.writeFileSync(absoluteFilePath, jsonContent, 'utf8')
  } catch (error: any) {
    throw new Error(`${ERROR_TAG}: Failed to write ledgers to file ${filePath}: ${error.message}`)
  }
}

/**
 * Reads and parses Indy ledgers from a JSON file at the specified file path.
 *
 * @throws {Error} - Throws an error if reading from the file fails, if the file path is invalid, or if parsing fails.
 * @param {string} filePath - The path to the JSON file to read the ledgers from.
 * @returns {*} {IndyLedgerJSON[]} - An array of Indy ledgers read from the file.
 */
export function readIndyLedgersFromFile(filePath: string): IndyLedgerJSON[] {
  try {
    if (!filePath.endsWith('.json')) {
      throw new Error('File path must point to a JSON file')
    }

    // Convert to absolute path ie: ./ledgers.json -> /Users/username/project/ledgers.json
    const absoluteFilePath = path.resolve(filePath)
    const jsonContent = fs.readFileSync(absoluteFilePath, 'utf8')

    return JSON.parse(jsonContent)
  } catch (error: any) {
    throw new Error(`${ERROR_TAG}: Failed to read ledgers from file ${filePath}: ${error.message}`)
  }
}
