import { getIndyLedgers, IndyLedger, writeIndyLedgersToFile } from '../packages/core/src/utils/ledger'

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

  writeIndyLedgersToFile('packages/core/src/configs/ledgers/indy/ledgers.json', ledgers)
}

main()
