import { AskarModule } from '@aries-framework/askar'
import { Agent, ConsoleLogger, LogLevel } from '@aries-framework/core'
import { IndySdkToAskarMigrationUpdater } from '@aries-framework/indy-sdk-to-askar-migration'
import { agentDependencies } from '@aries-framework/react-native'
import { ariesAskar } from '@hyperledger/aries-askar-react-native'
import { Platform } from 'react-native'
import * as RNFS from 'react-native-fs'

import { Migration as MigrationState } from '../types/state'

export const didMigrateToAskar = (state: MigrationState) => state.didMigrateToAskar

export const migrateToAskar = async (walletId: string, key: string, agent?: Agent) => {
  // The backup file is kept in case anything goes wrong. this will allow us to release patches and still update the
  // original indy-sdk database in a future version we could manually add a check to remove the old file from storage.
  const basePath = Platform.OS === 'ios' ? RNFS.DocumentDirectoryPath : RNFS.ExternalDirectoryPath
  const dbPath = `${basePath}/.indy_client/wallet/${walletId}/sqlite.db`
  const aAgent =
    agent ??
    new Agent({
      config: {
        label: 'Aries Bifold',
        walletConfig: {
          id: walletId,
          key,
        },
        logger: new ConsoleLogger(LogLevel.trace),
        autoUpdateStorageOnStartup: false,
      },
      modules: {
        askar: new AskarModule({
          ariesAskar,
        }),
      },
      dependencies: agentDependencies,
    })

  const updater = await IndySdkToAskarMigrationUpdater.initialize({
    dbPath,
    agent: aAgent,
  })

  await updater.update()
}
