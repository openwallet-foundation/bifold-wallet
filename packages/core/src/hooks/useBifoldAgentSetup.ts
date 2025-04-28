import { Agent, HttpOutboundTransport, WsOutboundTransport } from '@credo-ts/core'
import { IndyVdrPoolService } from '@credo-ts/indy-vdr/build/pool'
import { agentDependencies } from '@credo-ts/react-native'
import { GetCredentialDefinitionRequest, GetSchemaRequest } from '@hyperledger/indy-vdr-shared'
import { useCallback, useState } from 'react'
import { Config } from 'react-native-config'
import { CachesDirectoryPath } from 'react-native-fs'

import { TOKENS, useServices } from '../container-api'
import { DispatchAction } from '../contexts/reducers/store'
import { useStore } from '../contexts/store'
import { getAgentModules, createLinkSecretIfRequired } from '../utils/agent'
import { migrateToAskar } from '../utils/migration'
import { WalletSecret } from '../types/security'

export type AgentSetupReturnType = {
  agent: Agent | null
  initializeAgent: (walletSecret: WalletSecret) => Promise<void>
  shutdownAndClearAgentIfExists: () => Promise<void>
}

const useBifoldAgentSetup = (): AgentSetupReturnType => {
  const [agent, setAgent] = useState<Agent | null>(null)
  const [store, dispatch] = useStore()
  const [cacheSchemas, cacheCredDefs, logger, indyLedgers] = useServices([
    TOKENS.CACHE_SCHEMAS,
    TOKENS.CACHE_CRED_DEFS,
    TOKENS.UTIL_LOGGER,
    TOKENS.UTIL_LEDGERS,
  ])

  const createNewAgent = useCallback(
    async (walletSecret: WalletSecret): Promise<Agent> => {
      const newAgent = new Agent({
        config: {
          label: store.preferences.walletName || 'Aries Bifold',
          walletConfig: {
            id: walletSecret.id,
            key: walletSecret.key,
          },
          logger,
          autoUpdateStorageOnStartup: true,
        },
        dependencies: agentDependencies,
        modules: getAgentModules({
          indyNetworks: indyLedgers,
          mediatorInvitationUrl: Config.MEDIATOR_URL,
          txnCache: {
            capacity: 1000,
            expiryOffsetMs: 1000 * 60 * 60 * 24 * 7,
            path: CachesDirectoryPath + '/txn-cache',
          },
        }),
      })
      const wsTransport = new WsOutboundTransport()
      const httpTransport = new HttpOutboundTransport()

      newAgent.registerOutboundTransport(wsTransport)
      newAgent.registerOutboundTransport(httpTransport)

      return newAgent
    },
    [store.preferences.walletName, logger, indyLedgers]
  )

  const migrateIfRequired = useCallback(
    async (newAgent: Agent, walletSecret: WalletSecret) => {
      // If we haven't migrated to Aries Askar yet, we need to do this before we initialize the agent.
      if (!store.migration.didMigrateToAskar) {
        await migrateToAskar(walletSecret.id, walletSecret.key, newAgent)
        // Store that we migrated to askar.
        dispatch({
          type: DispatchAction.DID_MIGRATE_TO_ASKAR,
        })
      }
    },
    [store.migration.didMigrateToAskar, dispatch]
  )

  const warmUpCache = useCallback(
    async (newAgent: Agent) => {
      const poolService = newAgent.dependencyManager.resolve(IndyVdrPoolService)
      cacheCredDefs.forEach(async ({ did, id }) => {
        const pool = await poolService.getPoolForDid(newAgent.context, did)
        const credDefRequest = new GetCredentialDefinitionRequest({ credentialDefinitionId: id })
        await pool.pool.submitRequest(credDefRequest)
      })

      cacheSchemas.forEach(async ({ did, id }) => {
        const pool = await poolService.getPoolForDid(newAgent.context, did)
        const schemaRequest = new GetSchemaRequest({ schemaId: id })
        await pool.pool.submitRequest(schemaRequest)
      })
    },
    [cacheCredDefs, cacheSchemas]
  )

  const initializeAgent = useCallback(
    async (walletSecret: WalletSecret): Promise<void> => {
      logger.info('Creating agent')
      const newAgent = await createNewAgent(walletSecret)

      logger.info('Migrating if required...')
      await migrateIfRequired(newAgent, walletSecret)

      logger.info('Initializing agent...')
      await newAgent.initialize()

      logger.info('Creating link secret if required...')
      await createLinkSecretIfRequired(newAgent)

      logger.info('Warming up cache...')
      await warmUpCache(newAgent)

      logger.info('Agent initialized successfully')
      setAgent(newAgent)
    },
    [logger, createNewAgent, migrateIfRequired, warmUpCache]
  )

  const shutdownAndClearAgentIfExists = useCallback(async () => {
    if (agent) {
      try {
        await agent.shutdown()
      } catch (error) {
        logger.error(`Error shutting down agent with shutdownAndClearAgentIfExists: ${error}`)
      }
    }

    setAgent(null)
  }, [agent, logger])

  return { agent, initializeAgent, shutdownAndClearAgentIfExists }
}

export default useBifoldAgentSetup
