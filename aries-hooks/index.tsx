import React, { createContext, useState, useEffect, useContext, useCallback } from 'react'

import { downloadString, storeGenesis } from './utils'

import {
  Agent,
  InitConfig,
  HttpOutboundTransporter,
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
  WsOutboundTransporter,
} from '@aries-framework/core'

import { agentDependencies } from '@aries-framework/react-native'

const AgentContext = createContext<any>({})
const ConnectionContext = createContext<any>({})
const CredentialContext = createContext<any>({})
const ProofContext = createContext<any>({})

// Agent
export const useAgent = (): { agent: Agent; loading: boolean } => {
  return useContext(AgentContext)
}

// Connection
export const useConnections = (): { connections: ConnectionRecord[]; loading: boolean } => {
  return useContext(ConnectionContext)
}

export const useConnectionById = (id: string): ConnectionRecord => {
  const { connections } = useContext(ConnectionContext)
  const connection = connections.find((c: ConnectionRecord) => c.id === id)
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

export const useCredentialById = (id: string): CredentialRecord => {
  const { credentials } = useContext(CredentialContext)
  const credential = credentials.find((c: CredentialRecord) => c.id === id)
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

export const useProofById = (id: string): ProofRecord => {
  const { proofs } = useContext(ProofContext)
  const proof = proofs.find((p: ProofRecord) => p.id === id)
  return proof
}

export const useProofByState = (state: ProofState): ProofRecord[] => {
  const proofState = useContext(ProofContext)
  const proofs = proofState.proofs.filter((p: ProofRecord) => p.state === state)
  return proofs
}

interface Props {
  agentConfig: InitConfig
  mediatorUrl: string
  genesisUrl: string
}

const AgentProvider: React.FC<Props> = ({ agentConfig, mediatorUrl, genesisUrl, children }) => {
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

  const connectionStateChangedListener = useCallback(
    (event: ConnectionStateChangedEvent) => {
      const connections = connectionState.connections.filter(
        (connection) => connection.did !== event.payload.connectionRecord.did
      )
      setConnectionState({
        ...connectionState,
        connections: [...connections, event.payload.connectionRecord],
      })
    },
    [connectionState, setConnectionState]
  )

  useEffect(() => {
    if (!agentState.agent) {
      return
    }
    agentState.agent.events.on(ConnectionEventTypes.ConnectionStateChanged, connectionStateChangedListener)
    return () => {
      agentState.agent?.events.off(ConnectionEventTypes.ConnectionStateChanged, connectionStateChangedListener)
    }
  }, [agentState.agent, connectionStateChangedListener])

  const credentialStateChangedListener = useCallback(
    (event: CredentialStateChangedEvent) => {
      setCredentialState({
        ...credentialState,
        credentials: [...credentialState.credentials, event.payload.credentialRecord],
      })
    },
    [credentialState, setCredentialState]
  )

  useEffect(() => {
    if (!agentState.agent) {
      return
    }
    agentState.agent.events.on(CredentialEventTypes.CredentialStateChanged, credentialStateChangedListener)
    return () => {
      agentState.agent?.events.off(CredentialEventTypes.CredentialStateChanged, credentialStateChangedListener)
    }
  }, [agentState.agent, connectionStateChangedListener])

  const proofStateChangedListener = useCallback(
    (event: ProofStateChangedEvent) => {
      setProofState({ ...proofState, proofs: [...proofState.proofs, event.payload.proofRecord] })
    },
    [proofState, setProofState]
  )

  useEffect(() => {
    if (!agentState.agent) {
      return
    }
    agentState.agent.events.on(ProofEventTypes.ProofStateChanged, proofStateChangedListener)
    return () => {
      agentState.agent?.events.off(ProofEventTypes.ProofStateChanged, proofStateChangedListener)
    }
  }, [agentState.agent, connectionStateChangedListener])

  const setInitialState = async () => {
    const mediatorConnectionsInvite = await downloadString(`${mediatorUrl}/invitation`)
    const genesis = await downloadString(genesisUrl)
    const genesisPath = await storeGenesis(genesis, 'genesis.txn')

    const agent = new Agent({ ...agentConfig, mediatorConnectionsInvite, genesisPath }, agentDependencies)

    const wsTransport = new WsOutboundTransporter()
    const httpTransport = new HttpOutboundTransporter()

    agent.registerOutboundTransporter(wsTransport)
    agent.registerOutboundTransporter(httpTransport)

    await agent.initialize()
    const connections = await agent.connections.getAll()
    const credentials = await agent.credentials.getAll()
    const proofs = await agent.proofs.getAll()

    setAgentState({ agent, loading: false })
    setConnectionState({ connections, loading: false })
    setCredentialState({ credentials, loading: false })
    setProofState({ proofs, loading: false })
  }

  useEffect(() => {
    setInitialState().then(() => {
      // eslint-disable-next-line no-console
      console.debug('Agent initialized')
    })
  }, [])

  return (
    <AgentContext.Provider value={agentState}>
      <ConnectionContext.Provider value={connectionState}>
        <CredentialContext.Provider value={credentialState}>
          <ProofContext.Provider value={proofState}>{children}</ProofContext.Provider>
        </CredentialContext.Provider>
      </ConnectionContext.Provider>
    </AgentContext.Provider>
  )
}

export default AgentProvider
