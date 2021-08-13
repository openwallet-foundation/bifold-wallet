import React, { createContext, useState, useEffect, useContext } from 'react'

import { PollingInboundTransporter } from './transporters'
import { downloadGenesis, storeGenesis } from './genesis-utils'

import {
  Agent,
  InitConfig,
  HttpOutboundTransporter,
  ConnectionState,
  CredentialState,
  ProofState,
  ConnectionEventType,
  CredentialEventType,
  ProofEventType,
  ConnectionStateChangedEvent,
  CredentialStateChangedEvent,
  ProofStateChangedEvent,
} from 'aries-framework'

const AgentContext = createContext<any>({})
const ConnectionContext = createContext<any>({})
const CredentialContext = createContext<any>({})
const ProofContext = createContext<any>({})

interface Props {
  agentConfig: InitConfig
  contexts?: ['agent' | 'connections' | 'credentials' | 'proofs']
  genesisUrl: string
  children: any
}

interface AgentState {
  agent: Agent | null
  loading: boolean
}

// Agent
export const useAgent = (): { agent: Agent; loading: boolean } => {
  return useContext(AgentContext)
}

// Connection
export const useConnections = () => {
  return useContext(ConnectionContext)
}

export const useConnectionById = (id: string) => {
  const { connections } = useContext(ConnectionContext)
  const connection = connections.find((c: any) => c.id === id)
  return connection
}

export const useConnectionByState = (state: ConnectionState) => {
  const connectionState = useContext(ConnectionContext)
  const connections = connectionState.connections.filter((c: any) => c.state === state)
  return connections
}

// Credential
export const useCredentials = () => {
  return useContext(CredentialContext)
}

export const useCredentialById = (id: string) => {
  const { credentials } = useContext(CredentialContext)
  const credential = credentials.find((c: any) => c.id === id)
  return credential
}

export const useCredentialByState = (state: CredentialState) => {
  const credentialState = useContext(CredentialContext)
  const credentials = credentialState.credentials.filter((c: any) => c.state === state)
  return credentials
}

// Proofs
export const useProofs = () => {
  return useContext(ProofContext)
}

export const useProofById = (id: string) => {
  const { proofs } = useContext(ProofContext)
  const proof = proofs.find((p: any) => p.id === id)
  return proof
}

export const useProofByState = (state: ProofState) => {
  const proofState = useContext(ProofContext)
  const proofs = proofState.proofs.filter((p: any) => p.state === state)
  return proofs
}

const AgentProvider: React.FC<Props> = ({ agentConfig, contexts, children, genesisUrl }) => {
  const [agentState, setAgentState] = useState<AgentState>({
    agent: null,
    loading: true,
  })
  const [connectionState, setConnectionState] = useState<any>({ connections: [], loading: true })
  const [credentialState, setCredentialState] = useState<any>({ credentials: [], loading: true })
  const [proofState, setProofState] = useState<any>({ proofs: [], loading: true })

  useEffect(() => {
    setInitialState()
  }, [])

  const injectConnectionRecord = async (agent: Agent, credentials: any) => {
    const updatedCredentials = await credentials.map(async (c: any) => {
      const connectionRecord = await agent.connections.getById(c.id)
      return { ...c, connectionRecord }
    })
    return updatedCredentials
  }

  const setInitialState = async () => {
    const genesis = await downloadGenesis(genesisUrl)
    const genesisPath = await storeGenesis(genesis, 'genesis.txn')

    const agent = new Agent({ ...agentConfig, genesisPath })
    const outbound = new HttpOutboundTransporter(agent)
    agent.setInboundTransporter(new PollingInboundTransporter())
    agent.setOutboundTransporter(outbound)

    await agent.init()
    const connections = await agent.connections.getAll()
    const credentials = await agent.credentials.getAll()
    const proofs = await agent.proofs.getAll()

    const credentialsWithConnectionRecords = await injectConnectionRecord(agent, credentials)

    startConnectionsListener(agent)
    startCredentialsListener(agent)
    startProofsListener(agent)

    setAgentState({ agent, loading: false })
    setConnectionState({ connections, loading: false })
    setCredentialState({ credentials: credentialsWithConnectionRecords, loading: false })
    setProofState({ proofs, loading: false })
  }

  const startConnectionsListener = (agent: Agent) => {
    const listener = (event: ConnectionStateChangedEvent) => {
      setConnectionState({
        ...connectionState,
        connections: [...connectionState.connections, event.connectionRecord],
      })
    }

    agent.connections.events.on(ConnectionEventType.StateChanged, listener)
  }

  const startCredentialsListener = (agent: Agent) => {
    const listener = async (event: CredentialStateChangedEvent) => {
      const credentialWithConnectionRecord = await injectConnectionRecord(agent, [event.credentialRecord])

      setCredentialState({
        ...credentialState,
        credentials: [...credentialState.credentials, credentialWithConnectionRecord],
      })
    }

    agent.credentials.events.on(CredentialEventType.StateChanged, listener)
  }

  const startProofsListener = (agent: Agent) => {
    const listener = (event: ProofStateChangedEvent) => {
      setProofState({ ...proofState, proofs: [...proofState.proofs, event.proofRecord] })
    }

    agent.proofs.events.on(ProofEventType.StateChanged, listener)
  }

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
