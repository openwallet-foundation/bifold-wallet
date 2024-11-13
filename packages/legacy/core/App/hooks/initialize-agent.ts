import { Agent, HttpOutboundTransport, WsOutboundTransport, WalletError } from '@credo-ts/core'
import { IndyVdrPoolService } from '@credo-ts/indy-vdr/build/pool'
import { useAgent } from '@credo-ts/react-hooks'
import { agentDependencies } from '@credo-ts/react-native'
import { GetCredentialDefinitionRequest, GetSchemaRequest } from '@hyperledger/indy-vdr-shared'
import { useCallback } from 'react'
import { Config } from 'react-native-config'
import { CachesDirectoryPath } from 'react-native-fs'

import { TOKENS, useServices } from '../container-api'
import { useAuth } from '../contexts/auth'
import { DispatchAction } from '../contexts/reducers/store'
import { useStore } from '../contexts/store'
import { BifoldError } from '../types/error'
import { getAgentModules, createLinkSecretIfRequired } from '../utils/agent'
import { migrateToAskar } from '../utils/migration'

const useInitializeAgent = () => {
  const { agent, setAgent } = useAgent()
  const [store, dispatch] = useStore()
  const { walletSecret } = useAuth()
  const [cacheSchemas, cacheCredDefs, logger, indyLedgers] = useServices([
    TOKENS.CACHE_SCHEMAS,
    TOKENS.CACHE_CRED_DEFS,
    TOKENS.UTIL_LOGGER,
    TOKENS.UTIL_LEDGERS,
  ])

  const restartExistingAgent = useCallback(async () => {
    if (!walletSecret?.id || !walletSecret.key || !agent) {
      return
    }

    logger.info('Agent already initialized, restarting...')

    try {
      await agent.wallet.open({
        id: walletSecret.id,
        key: walletSecret.key,
      })

      logger.info('Opened agent wallet')
    } catch (error: unknown) {
      // Credo does not use error codes but this will be in the
      // the error message if the wallet is already open.
      const catchPhrase = 'instance already opened'

      if (error instanceof WalletError && error.message.includes(catchPhrase)) {
        logger.warn('Wallet already open, nothing to do')
      } else {
        logger.error('Error opening existing wallet:', error as Error)

        throw new BifoldError(
          'Wallet Service',
          'There was a problem unlocking the wallet.',
          (error as Error).message,
          1047
        )
      }
    }

    await agent.mediationRecipient.initiateMessagePickup()
  }, [agent, walletSecret, logger])

  const createNewAgent = useCallback(async (): Promise<Agent | undefined> => {
    if (!walletSecret?.id || !walletSecret.key) {
      return
    }

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
  }, [walletSecret, store.preferences.walletName, logger, indyLedgers])

  const migrateIfRequired = useCallback(async (newAgent: Agent) => {
    if (!walletSecret?.id || !walletSecret.key) {
      return
    }

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
  }, [walletSecret, store.migration.didMigrateToAskar, dispatch])

  const warmUpCache = useCallback(async (newAgent: Agent) => {
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
  }, [cacheCredDefs, cacheSchemas])

  const initializeAgent = useCallback(async (): Promise<Agent | undefined> => {
    if (!walletSecret?.id || !walletSecret.key) {
      return
    }

    if (agent) {
      await restartExistingAgent()
      return agent
    }

    const newAgent = await createNewAgent()
    if (!newAgent) {
      return
    }

    await migrateIfRequired(newAgent)

    await newAgent.initialize()

    await createLinkSecretIfRequired(newAgent)

    await warmUpCache(newAgent)

    setAgent(newAgent)

    return newAgent
  }, [
    agent,
    setAgent,
    walletSecret,
    restartExistingAgent,
    createNewAgent,
    migrateIfRequired,
    warmUpCache,
  ])

  return { initializeAgent }
}

export default useInitializeAgent
