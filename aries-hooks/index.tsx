import React, { createContext, useState, useEffect, useContext } from 'react'

import { downloadGenesis, storeGenesis } from './genesis-utils'

import {
  Agent,
  InitConfig,
  HttpOutboundTransport,
  ConnectionState,
  CredentialState,
  ProofState,
  ConnectionEventTypes,
  CredentialEventTypes,
  ProofEventTypes,
  ConnectionStateChangedEvent,
  CredentialStateChangedEvent,
  ProofStateChangedEvent,
  ConnectionRecord,
  ProofRecord,
  CredentialRecord,
  WsOutboundTransport,
  BasicMessageRecord,
  BasicMessageReceivedEvent,
  BasicMessageEventTypes,
} from '@aries-framework/core'

import { agentDependencies } from '@aries-framework/react-native'

const TAG = 'Aries-Hooks:'

const AgentContext = createContext<any>({})
const ConnectionContext = createContext<any>({})
const CredentialContext = createContext<any>({})
const ProofContext = createContext<any>({})
const BasicMessageContext = createContext<any>({})

// Agent
export const useAgent = (): { agent: Agent; loading: boolean } => {
  return useContext(AgentContext)
}

// Connection
export const useConnections = (): { connections: ConnectionRecord[]; loading: boolean } => {
  return useContext(ConnectionContext)
}

export const useConnectionById = (id: string): ConnectionRecord | undefined => {
  const { connections } = useContext(ConnectionContext)
  const connection = connections.find((c: ConnectionRecord) => c.id === id)
  if (!connection) {
    console.warn(TAG, `Could not find Connection By ID ${id}`)
  }
  return connection
}

export const useConnectionByState = (state: ConnectionState): ConnectionRecord[] => {
  const connectionState = useContext(ConnectionContext)
  const connections = connectionState.connections.filter((c: ConnectionRecord) => c.state === state)
  return connections
}

// Credential
export const useCredentials = (): { credentials: CredentialRecord[]; loading: boolean } => {
  return useContext(CredentialContext)
}

export const useCredentialById = (id: string): CredentialRecord | undefined => {
  const { credentials } = useContext(CredentialContext)
  const credential = credentials.find((c: CredentialRecord) => c.id === id)
  if (!credential) {
    console.warn(TAG, `Could not find Credential By ID ${id}`)
  }
  return credential
}

export const useCredentialByState = (state: CredentialState): CredentialRecord[] => {
  const credentialState = useContext(CredentialContext)
  const credentials = credentialState.credentials.filter((c: CredentialRecord) => c.state === state)
  return credentials
}

// Proofs
export const useProofs = (): { proofs: ProofRecord[]; loading: boolean } => {
  return useContext(ProofContext)
}

export const useProofById = (id: string): ProofRecord | undefined => {
  const { proofs } = useContext(ProofContext)
  const proof = proofs.find((p: ProofRecord) => p.id === id)
  if (!proof) {
    console.warn(TAG, `Could not find Proof By ID ${id}`)
  }
  return proof
}

export const useProofByState = (state: ProofState): ProofRecord[] => {
  const proofState = useContext(ProofContext)
  const proofs = proofState.proofs.filter((p: ProofRecord) => p.state === state)
  return proofs
}

//BasicMessages
export const useBasicMessagesByConnectionId = (connectionId: string): BasicMessageRecord[] => {
  const { basicMessages } = useContext(BasicMessageContext)
  const connectionMessages = basicMessages.filter((m: BasicMessageRecord) => m.connectionId === connectionId)
  return connectionMessages
}

interface Props {
  agentConfig: InitConfig
  genesisUrl: string
  children: React.ReactChildren
}

const AgentProvider: React.FC<Props> = ({ agentConfig, genesisUrl, children }) => {
  const [agentState, setAgentState] = useState<{
    agent: Agent | null
    loading: boolean
  }>({
    agent: null,
    loading: true,
  })
  const [connectionState, setConnectionState] = useState<{ connections: ConnectionRecord[] | []; loading: boolean }>({
    connections: [],
    loading: true,
  })
  const [credentialState, setCredentialState] = useState<{ credentials: CredentialRecord[] | []; loading: boolean }>({
    credentials: [],
    loading: true,
  })
  const [proofState, setProofState] = useState<{ proofs: ProofRecord[] | []; loading: boolean }>({
    proofs: [],
    loading: true,
  })
  const [basicMessageState, setBasicMessageState] = useState<{
    basicMessages: BasicMessageRecord[] | []
    loading: boolean
  }>({ basicMessages: [], loading: true })

  useEffect(() => {
    setInitialState()
  }, [])

  const setInitialState = async () => {
    try {
      const genesis = await downloadGenesis(genesisUrl)
      const genesisPath = await storeGenesis(genesis, 'genesis.txn')

      const agent = new Agent({ ...agentConfig, genesisPath }, agentDependencies)

      const wsTransport = new WsOutboundTransport()
      const httpTransport = new HttpOutboundTransport()

      agent.registerOutboundTransport(wsTransport)
      agent.registerOutboundTransport(httpTransport)

      await agent.initialize()
      const connections = await agent.connections.getAll()
      const credentials = await agent.credentials.getAll()
      const proofs = await agent.proofs.getAll()
      const basicMessages = await agent.basicMessages.findAllByQuery({})

      setAgentState({ agent, loading: false })
      setConnectionState({ connections, loading: false })
      setCredentialState({ credentials, loading: false })
      setProofState({ proofs, loading: false })
      setBasicMessageState({ basicMessages, loading: false })
    } catch (e) {
      console.error(TAG, 'ERROR IN SET_INITIAL_STATE:', e)
    }
  }

  useEffect(() => {
    if (!connectionState.loading) {
      const listener = (event: ConnectionStateChangedEvent) => {
        console.debug(TAG, 'Connection Event', event)

        let newConnectionsState = connectionState.connections
        const index = newConnectionsState.findIndex((connection) => connection.id === event.payload.connectionRecord.id)
        if (index > -1) {
          newConnectionsState[index] = event.payload.connectionRecord
        } else {
          newConnectionsState = [...newConnectionsState, event.payload.connectionRecord]
        }

        setConnectionState({
          loading: connectionState.loading,
          connections: newConnectionsState,
        })
      }
      agentState.agent?.events.on(ConnectionEventTypes.ConnectionStateChanged, listener)

      return () => {
        agentState.agent?.events.off(ConnectionEventTypes.ConnectionStateChanged, listener)
      }
    }
  }, [connectionState])

  useEffect(() => {
    if (!credentialState.loading) {
      const listener = async (event: CredentialStateChangedEvent) => {
        console.debug(TAG, 'Credential Event', event)

        let newCredentialsState = credentialState.credentials
        const index = newCredentialsState.findIndex((credential) => credential.id === event.payload.credentialRecord.id)
        if (index > -1) {
          newCredentialsState[index] = event.payload.credentialRecord
        } else {
          newCredentialsState = [...newCredentialsState, event.payload.credentialRecord]
        }

        setCredentialState({
          loading: credentialState.loading,
          credentials: newCredentialsState,
        })
      }
      agentState.agent?.events.on(CredentialEventTypes.CredentialStateChanged, listener)

      return () => {
        agentState.agent?.events.off(CredentialEventTypes.CredentialStateChanged, listener)
      }
    }
  }, [credentialState])

  useEffect(() => {
    if (!proofState.loading) {
      const listener = (event: ProofStateChangedEvent) => {
        console.debug(TAG, 'Proof Event', event)

        let newProofsState = proofState.proofs
        const index = newProofsState.findIndex((proof) => proof.id === event.payload.proofRecord.id)
        if (index > -1) {
          newProofsState[index] = event.payload.proofRecord
        } else {
          newProofsState = [...newProofsState, event.payload.proofRecord]
        }

        setProofState({
          loading: proofState.loading,
          proofs: newProofsState,
        })
      }

      agentState.agent?.events.on(ProofEventTypes.ProofStateChanged, listener)

      return () => {
        agentState.agent?.events.off(ProofEventTypes.ProofStateChanged, listener)
      }
    }
  }, [proofState])

  useEffect(() => {
    if (!basicMessageState.loading) {
      const listener = (event: BasicMessageReceivedEvent) => {
        console.debug(TAG, 'Basic Message Event', event)

        let newBasicMessageState = basicMessageState.basicMessages
        const index = newBasicMessageState.findIndex(
          (basicMessage) => basicMessage.id === event.payload.basicMessageRecord.id
        )
        if (index > -1) {
          newBasicMessageState[index] = event.payload.basicMessageRecord
        } else {
          newBasicMessageState = [...newBasicMessageState, event.payload.basicMessageRecord]
        }

        setBasicMessageState({
          loading: basicMessageState.loading,
          basicMessages: newBasicMessageState,
        })
      }

      agentState.agent?.events.on(BasicMessageEventTypes.BasicMessageReceived, listener)

      return () => {
        agentState.agent?.events.off(BasicMessageEventTypes.BasicMessageReceived, listener)
      }
    }
  }, [basicMessageState])

  return (
    <AgentContext.Provider value={agentState}>
      <ConnectionContext.Provider value={connectionState}>
        <CredentialContext.Provider value={credentialState}>
          <ProofContext.Provider value={proofState}>
            <BasicMessageContext.Provider value={basicMessageState}>{children}</BasicMessageContext.Provider>
          </ProofContext.Provider>
        </CredentialContext.Provider>
      </ConnectionContext.Provider>
    </AgentContext.Provider>
  )
}

export default AgentProvider
