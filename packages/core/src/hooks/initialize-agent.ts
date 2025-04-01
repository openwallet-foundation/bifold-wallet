import { Agent, HttpOutboundTransport, WsOutboundTransport } from '@credo-ts/core'
import { IndyVdrPoolService } from '@credo-ts/indy-vdr/build/pool'
import { useAgent } from '@credo-ts/react-hooks'
import { agentDependencies } from '@credo-ts/react-native'
import { GetCredentialDefinitionRequest, GetSchemaRequest } from '@hyperledger/indy-vdr-shared'
import { useCallback } from 'react'
import { Config } from 'react-native-config'
import { CachesDirectoryPath } from 'react-native-fs'

import { TOKENS, useServices } from '../container-api'
import { DispatchAction } from '../contexts/reducers/store'
import { useStore } from '../contexts/store'
import { getAgentModules, createLinkSecretIfRequired } from '../utils/agent'
import { migrateToAskar } from '../utils/migration'
import { WalletSecret } from '../types/security'

const useInitializeAgent = () => {
  const { agent, setAgent } = useAgent()
  const [store, dispatch] = useStore()
  const [cacheSchemas, cacheCredDefs, logger, indyLedgers] = useServices([
    TOKENS.CACHE_SCHEMAS,
    TOKENS.CACHE_CRED_DEFS,
    TOKENS.UTIL_LOGGER,
    TOKENS.UTIL_LEDGERS,
  ])

  const restartExistingAgent = useCallback(
    async (walletSecret: WalletSecret) => {
      // if the agent is initialized, it was not a clean shutdown and should be replaced, not restarted
      if (!agent || agent.isInitialized) {
        return
      }

      logger.info('Agent already created, restarting...')
      try {
        await agent.wallet.open({
          id: walletSecret.id,
          key: walletSecret.key,
        })
        await agent.initialize()
      } catch {
        // if the existing agents wallet cannot be opened or initialize() fails it was
        // again not a clean shutdown and the agent should be replaced, not restarted
        logger.warn('Failed to restart existing agent, skipping agent restart')
        return
      }

      logger.info('Successfully restarted existing agent')
      return agent
    },
    [agent, logger]
  )

  const createNewAgent = useCallback(
    async (walletSecret: WalletSecret): Promise<Agent | undefined> => {
      logger.info('No agent initialized, creating a new one')

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
        newAgent.config.logger.debug('Agent not updated to Aries Askar, updating...')

        await migrateToAskar(walletSecret.id, walletSecret.key, newAgent)

        newAgent.config.logger.debug('Successfully finished updating agent to Aries Askar')
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
    async (walletSecret: WalletSecret): Promise<Agent | undefined> => {
      const existingAgent = await restartExistingAgent(walletSecret)
      if (existingAgent) {
        setAgent(existingAgent)
        return existingAgent
      }

      const newAgent = await createNewAgent(walletSecret)
      if (!newAgent) {
        logger.error('Failed to create a new agent')
        return
      }

      await migrateIfRequired(newAgent, walletSecret)

      await newAgent.initialize()

      await createLinkSecretIfRequired(newAgent)

      await warmUpCache(newAgent)

      setAgent(newAgent)

      return newAgent
    },
    [logger, restartExistingAgent, setAgent, createNewAgent, migrateIfRequired, warmUpCache]
  )

  return { initializeAgent }
}

export default useInitializeAgent
