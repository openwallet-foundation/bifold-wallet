import { Agent, HttpOutboundTransport, WsOutboundTransport } from '@credo-ts/core'
import { IndyVdrPoolService } from '@credo-ts/indy-vdr/build/pool'
import { agentDependencies } from '@credo-ts/react-native'
import { GetCredentialDefinitionRequest, GetSchemaRequest } from '@hyperledger/indy-vdr-shared'
import { useCallback, useRef, useState } from 'react'
import { CachesDirectoryPath } from 'react-native-fs'

import { TOKENS, useServices } from '../container-api'
import { DispatchAction } from '../contexts/reducers/store'
import { useStore } from '../contexts/store'
import { WalletSecret } from '../types/security'
import { createLinkSecretIfRequired, getAgentModules } from '../utils/agent'
import { migrateToAskar } from '../utils/migration'

export type AgentSetupReturnType = {
  agent: Agent | null
  initializeAgent: (walletSecret: WalletSecret) => Promise<void>
  shutdownAndClearAgentIfExists: () => Promise<void>
}

const useBifoldAgentSetup = (): AgentSetupReturnType => {
  const [agent, setAgent] = useState<Agent | null>(null)
  const agentInstanceRef = useRef<Agent | null>(null)
  const [store, dispatch] = useStore()
  const [cacheSchemas, cacheCredDefs, logger, indyLedgers, bridge] = useServices([
    TOKENS.CACHE_SCHEMAS,
    TOKENS.CACHE_CRED_DEFS,
    TOKENS.UTIL_LOGGER,
    TOKENS.UTIL_LEDGERS,
    TOKENS.UTIL_AGENT_BRIDGE,
    TOKENS.UTIL_REFRESH_ORCHESTRATOR,
  ])

  //Leave here to re-configure orchestrator if needed in future
  // useMemo(() => {
  //   orchestrator.configure({ autoStart: true, intervalMs: 1 * 60 * 1000 })
  // }, [orchestrator])

  const restartExistingAgent = useCallback(
    async (agent: Agent, walletSecret: WalletSecret): Promise<Agent | undefined> => {
      try {
        await agent.wallet.open({
          id: walletSecret.id,
          key: walletSecret.key,
        })
        await agent.initialize()
      } catch (error) {
        logger.warn(`Agent restart failed with error ${error}`)
        // if the existing agents wallet cannot be opened or initialize() fails it was
        // again not a clean shutdown and the agent should be replaced, not restarted
        return
      }

      return agent
    },
    [logger]
  )

  const createNewAgent = useCallback(
    async (walletSecret: WalletSecret, mediatorUrl: string): Promise<Agent> => {
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
          mediatorInvitationUrl: mediatorUrl,
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
      const mediatorUrl = store.preferences.selectedMediator
      logger.info('Checking for existing agent...')
      if (agentInstanceRef.current) {
        const restartedAgent = await restartExistingAgent(agentInstanceRef.current, walletSecret)
        if (restartedAgent) {
          logger.info('Successfully restarted existing agent...')
          agentInstanceRef.current = restartedAgent
          setAgent(restartedAgent)
          return
        }
      }

      logger.info('Creating new agent...')
      const newAgent = await createNewAgent(walletSecret, mediatorUrl)

      logger.info('Migrating if required...')
      await migrateIfRequired(newAgent, walletSecret)

      logger.info('Initializing agent...')
      await newAgent.initialize()

      logger.info('Creating link secret if required...')
      await createLinkSecretIfRequired(newAgent)

      logger.info('Warming up cache...')
      await warmUpCache(newAgent)

      logger.info('Agent initialized successfully')
      agentInstanceRef.current = newAgent
      setAgent(newAgent)
      bridge.setAgent(newAgent)
    },
    [
      logger,
      restartExistingAgent,
      createNewAgent,
      migrateIfRequired,
      warmUpCache,
      store.preferences.selectedMediator,
      bridge,
    ]
  )

  const shutdownAndClearAgentIfExists = useCallback(async () => {
    if (agent) {
      try {
        await agent.shutdown()
      } catch (error) {
        logger.error(`Error shutting down agent with shutdownAndClearAgentIfExists: ${error}`)
      } finally {
        bridge.clearAgent()
        setAgent(null)
      }
    }
  }, [agent, logger, bridge])

  return { agent, initializeAgent, shutdownAndClearAgentIfExists }
}

export default useBifoldAgentSetup
