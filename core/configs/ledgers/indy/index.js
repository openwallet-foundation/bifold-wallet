import Config from 'react-native-config'

import BCovrinTest from './bcovrin-test/pool-config'
import CandyDev from './candy-dev/pool-config'
import IndicioTestNet from './indicio-test-net/pool-config'
import loadGenesis from './loader'
import SovrinBuilderNet from './sovrin-builder-net/pool-config'
import SovrinMainNet from './sovrin-main-net/pool-config'
import SovrinStagingNet from './sovrin-staging-net/pool-config'

async function getIndyLedgers() {
  const ledgers = [SovrinMainNet, SovrinStagingNet, IndicioTestNet, CandyDev, BCovrinTest, SovrinBuilderNet]

  if (Config.GENESIS_URL) {
    const genesis = await loadGenesis(Config.GENESIS_URL)
    ledgers.unshift({
      id: 'EnvLedger',
      isProduction: true,
      genesisTransactions: genesis,
    })
  }

  return ledgers
}

export default getIndyLedgers
