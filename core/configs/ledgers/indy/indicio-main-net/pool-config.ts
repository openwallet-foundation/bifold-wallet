import { IndyPoolConfig } from '@aries-framework/core/build/modules/ledger/IndyPool'

import genesisFile from './genesis-file'

const config: IndyPoolConfig = {
  id: 'IndicioMainNet',
  genesisTransactions: genesisFile,
  isProduction: true,
}

export default config
