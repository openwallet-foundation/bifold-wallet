import fs from 'fs'
import path from 'path'
import {
  getIndyLedgers,
  IndyLedger,
  IndyLedgerFileSystem,
  writeIndyLedgersToFile,
} from '../packages/core/src/utils/ledger'

const LEDGERS_JSON_FILE = 'packages/core/src/configs/ledgers/indy/ledgers.json'

const fileSystem: IndyLedgerFileSystem = {
  writeFile: (filePath: string, data: string) => fs.writeFileSync(filePath, data, 'utf8'),
  readFile: (filePath: string) => fs.readFileSync(filePath, 'utf8'),
  fileExists: (filePath: string) => fs.existsSync(filePath),
  pathResolve: (filePath: string) => path.resolve(filePath),
}

/**
 * Main function to refresh Indy ledgers and write them to a file.
 *
 * @returns {*} {Promise<void>}
 */
async function main() {
  const ledgers = await getIndyLedgers([
    { ledgerId: IndyLedger.BCOVRIN_TEST, isProduction: false },
    { ledgerId: IndyLedger.CANDY_DEV_NETWORK, isProduction: false },
    { ledgerId: IndyLedger.CANDY_TEST_NETWORK, isProduction: false },
    { ledgerId: IndyLedger.CANDY_PRODUCTION_NETWORK, isProduction: true },
    { ledgerId: IndyLedger.INDICO_MAINNET, isProduction: true },
    { ledgerId: IndyLedger.INDICO_DEMONET, isProduction: false },
    { ledgerId: IndyLedger.INDICO_TESTNET, isProduction: false },
  ])

  writeIndyLedgersToFile(fileSystem, LEDGERS_JSON_FILE, ledgers)
}

main()
