import { AskarModule } from '@credo-ts/askar'
import { Agent, ConsoleLogger, LogLevel } from '@credo-ts/core'
import { IndySdkToAskarMigrationUpdater } from '@credo-ts/indy-sdk-to-askar-migration'
import { agentDependencies } from '@credo-ts/react-native'
import { ariesAskar } from '@hyperledger/aries-askar-react-native'
import { Platform } from 'react-native'
import * as RNFS from 'react-native-fs'

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
