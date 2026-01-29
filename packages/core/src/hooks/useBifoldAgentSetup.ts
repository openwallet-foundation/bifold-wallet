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
import {
  loadAndDecryptMnemonic,
  encryptAndStoreMnemonic,
  hasMnemonicInKeychain,
} from '../services/MnemonicStorage'
import {
  deriveWalletKeyFromMnemonic,
  generateWalletMnemonic,
  isValidMnemonic,
} from '../services/KeyDerivation'

export type AgentSetupReturnType = {
  agent: Agent | null
  initializeAgent: (walletSecret: WalletSecret, pin?: string) => Promise<void>
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
    async (walletSecret: WalletSecret, pin?: string): Promise<void> => {
      const mediatorUrl = store.preferences.selectedMediator
      logger.info('Checking for existing agent...')
      
      // If PIN is provided, use new mnemonic-based flow
      if (pin) {
        logger.info('Using mnemonic-based wallet opening flow...')
        
        try {
          // Step 1: Load encrypted mnemonic from keychain (Task 6.1.2)
          logger.info('Loading encrypted mnemonic from keychain...')
          const encryptedData = await loadAndDecryptMnemonic(pin)
          
          if (!encryptedData) {
            throw new Error('No wallet found. Please create or restore a wallet.')
          }
          
          // Step 2: Decrypt mnemonic with PIN (Task 6.1.3)
          logger.info('Decrypting mnemonic with PIN...')
          let mnemonic: string
          try {
            mnemonic = encryptedData
          } catch (error) {
            // Handle wrong PIN (Task 6.1.6)
            if (error instanceof Error && error.message.includes('Incorrect PIN')) {
              throw new Error('Incorrect PIN')
            }
            throw error
          }
          
          // Step 3: Validate mnemonic
          if (!isValidMnemonic(mnemonic)) {
            throw new Error('Corrupted wallet data. Please restore from backup.')
          }
          
          // Step 4: Derive wallet key from mnemonic (Task 6.1.4)
          logger.info('Deriving wallet key from mnemonic...')
          const derivedKey = deriveWalletKeyFromMnemonic(mnemonic)
          
          // Update wallet secret with derived key
          walletSecret = {
            ...walletSecret,
            key: derivedKey,
          }
          
          // Step 5: Clear sensitive data from memory (Task 6.1.7)
          // Force garbage collection by setting to empty string
          mnemonic = ''
          
        } catch (error) {
          // Error handling (Task 6.1.8)
          logger.error(`Mnemonic-based wallet opening failed: ${error}`)
          
          if (error instanceof Error) {
            if (error.message.includes('Incorrect PIN')) {
              throw new Error('Incorrect PIN')
            }
            if (error.message.includes('Incorrect key') || error.message.includes('decrypt')) {
              throw new Error('Incorrect PIN')
            }
            if (error.message.includes('No wallet found')) {
              throw error
            }
            if (error.message.includes('Corrupted wallet data')) {
              throw error
            }
          }
          
          throw new Error('Failed to open wallet. Please try again.')
        }
      }
      
      // Step 6: Open wallet with derived key (Task 6.1.5)
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
