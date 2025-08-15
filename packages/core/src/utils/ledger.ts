import axios from 'axios'

const INDY_NETWORK_URL =
  'https://raw.githubusercontent.com/hyperledger/indy-node-monitor/main/fetch-validator-status/allHyperLedgers.json'

enum INDY_LEDGER_ID {
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

interface IIndyLedgerConfig {
  id: INDY_LEDGER_ID
  connectOnStartup: boolean
  isProduction: boolean
}

interface IIndyLedger {
  id: string
  indyNamespace: string
  isProduction: boolean
  connectOnStartup: boolean
  gennesisTransactions: string
}

type IndyLedgersRecord = Record<
  INDY_LEDGER_ID,
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
async function _getUrlContent<T>(url: string): Promise<T> {
  try {
    const response = await axios.get<T>(url)
    return response.data
  } catch (error: any) {
    throw new Error(`LEDGER ERROR: Failed to fetch content from URL ${url}: ${error.message}`)
  }
}

/**
 * Filters and returns the ledgers based on the provided Indy ledger configurations.
 *
 * @throws {Error} - Throws an error if a network is not found in the IndyLedgersRecord.
 * @param {IIndyLedgerConfig[]} indyLedgerConfigs - The list of supported Indy ledger configurations.
 * @returns {Promise<IIndyLedger[]>} - A promise that resolves to an array of ledgers.
 */
export async function getIndyLedgers(indyLedgerConfigs: IIndyLedgerConfig[]): Promise<IIndyLedger[]> {
  // Fetch all hyperledgers from the provided URL
  const allHyperLedgers = await _getUrlContent<IndyLedgersRecord>(INDY_NETWORK_URL)

  const ledgers: IIndyLedger[] = []
  // Iterate through the supported networks and map them to the Indy ledgers
  for (const network of indyLedgerConfigs) {
    const indyNetwork = allHyperLedgers[network.id]

    ledgers.push({
      // Remove all whitespace to form the ledger ID
      id: indyNetwork.name.replace(/\s+/g, ''),
      indyNamespace: indyNetwork.indyNamespace,
      isProduction: network.isProduction,
      connectOnStartup: network.connectOnStartup,
      // This url will need to be fetched to get the genesis transactions
      gennesisTransactions: indyNetwork.genesisUrl,
    })
  }

  // Step 1: Collect all genesis transaction promises
  const genesisPromises = ledgers.map((ledger) => _getUrlContent<string>(ledger.gennesisTransactions))

  // Step 2: Await all promises to resolve in parallel
  const genesisTransactions = await Promise.all(genesisPromises)

  // Step 3: Assign the fetched genesis transactions back to the ledgers
  genesisTransactions.forEach((transactions, index) => {
    ledgers[index].gennesisTransactions = transactions.trim()
  })

  return ledgers
}
