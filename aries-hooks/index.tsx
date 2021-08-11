import React, { createContext, useState, useEffect, useContext } from 'react'

import { PollingInboundTransporter } from '../transporters'

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
} from 'aries-framework'

const AgentContext = createContext<any>({})
const ConnectionContext = createContext<any>({})
const CredentialContext = createContext<any>({})
const ProofContext = createContext<any>({})

interface Props {
  agent: InitConfig
  contexts?: ['agent' | 'connections' | 'credentials' | 'proofs']
  children: any
}

// Agent
export const useAgent = () => {
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
  const { connections } = useContext(ConnectionContext)
  const connection = connections.filter((c: any) => c.state === state)
  return connection
}

// Credential
export const useCredentials = () => {
  const credentialState = useContext(CredentialContext)
  return credentialState
}

export const useCredentialById = (id: string) => {
  const { credentials } = useContext(CredentialContext)
  const credential = credentials.find((c: any) => c.id === id)
  return credential
}

export const useCredentialByState = (state: CredentialState) => {
  const { credentials } = useContext(CredentialContext)
  const credential = credentials.filter((c: any) => c.state === state)
  return credential
}

// Proofs
export const useProofs = () => {
  const proofState = useContext(ProofContext)
  return proofState
}

export const useProofById = (id: string) => {
  const { proofs } = useContext(ProofContext)
  const proof = proofs.find((p: any) => p.id === id)
  return proof
}

export const useProofByState = (state: ProofState) => {
  const { proofs } = useContext(ProofContext)
  const proof = proofs.filter((p: any) => p.state === state)
  return proof
}

const AgentProvider: React.FC<Props> = ({ agent, contexts, children }) => {
  const [agentState, setAgentState] = useState<any>({})
  const [connectionState, setConnectionState] = useState<any>({ connections: [], loading: true })
  const [credentialState, setCredentialState] = useState<any>({ credentials: [], loading: true })
  const [proofState, setProofState] = useState<any>({ proofs: [], loading: true })

  useEffect(() => {
    setInitialState()
  }, [])

  const setInitialState = async () => {
    let newAgent = new Agent(agent)

    let outbound = new HttpOutboundTransporter(newAgent)

    newAgent.setInboundTransporter(new PollingInboundTransporter())
    newAgent.setOutboundTransporter(outbound)

    await newAgent.initialize()
    const connections = await newAgent.connections.getAll()
    const credentials = await newAgent.credentials.getAll()
    const proofs = await newAgent.proofs.getAll()

    startConnectionsListener(newAgent)
    startCredentialsListener(newAgent)
    startProofsListener(newAgent)

    setAgentState({ agent: newAgent, loading: false })
    setConnectionState({ connections, loading: false })
    setCredentialState({ credentials, loading: false })
    setProofState({ proofs, loading: false })
  }

  const startConnectionsListener = (agent: Agent) => {
    const listener = (event: ConnectionStateChangedEvent) => {
      switch (event.payload.connectionRecord.state) {
        case ConnectionState.Complete:
          setConnectionState({
            ...connectionState,
            connections: [...connectionState.connections, event.payload.connectionRecord],
          })
          break
        case ConnectionState.Invited:
          break
        case ConnectionState.Requested:
          break
        case ConnectionState.Responded:
          break
        default:
          break
      }
    }

    agent.events.on(ConnectionEventTypes.ConnectionStateChanged, listener)
  }

  const startCredentialsListener = (agent: Agent) => {
    const listener = (event: CredentialStateChangedEvent) => {
      switch (event.payload.credentialRecord.state) {
        case CredentialState.Done:
          setCredentialState({
            ...credentialState,
            credentials: [...credentialState.credentials, event.payload.credentialRecord],
          })
          break
        case CredentialState.CredentialIssued:
          break
        case CredentialState.CredentialReceived:
          break
        case CredentialState.OfferReceived:
          break
        case CredentialState.OfferSent:
          break
        case CredentialState.ProposalReceived:
          break
        case CredentialState.ProposalSent:
          break
        case CredentialState.RequestReceived:
          break
        case CredentialState.RequestSent:
          break
        default:
          break
      }
    }

    agent.events.on(CredentialEventTypes.CredentialStateChanged, listener)
  }

  const startProofsListener = (agent: Agent) => {
    const listener = (event: ProofStateChangedEvent) => {
      switch (event.payload.proofRecord.state) {
        case ProofState.Done:
          setProofState({ ...proofState, proofs: [...proofState.proofs, event.payload.proofRecord] })
          break
        case ProofState.PresentationReceived:
          break
        case ProofState.PresentationSent:
          break
        case ProofState.ProposalReceived:
          break
        case ProofState.ProposalSent:
          break
        case ProofState.RequestReceived:
          break
        case ProofState.RequestSent:
          break
        default:
          break
      }
    }

    agent.events.on(ProofEventTypes.ProofStateChanged, listener)
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
