import type { Agent } from '@credo-ts/core'
import type { PropsWithChildren } from 'react'

import * as React from 'react'
import { createContext, useContext, useMemo } from 'react'

import BasicMessageProvider from './BasicMessageProvider'
import ConnectionProvider from './ConnectionProvider'
import CredentialFormatDataProvider from './CredentialFormatDataProvider'
import CredentialProvider from './CredentialProvider'
import ProofFormatDataProvider from './ProofFormatDataProvider'
import ProofProvider from './ProofProvider'
import QuestionAnswerProvider from './QuestionAnswerProvider'

interface AgentContextInterface<AppAgent extends Agent = Agent> {
  loading: boolean
  agent: AppAgent | undefined
}

const AgentContext = createContext<AgentContextInterface | undefined>(undefined)

export const useAgent = <AppAgent extends Agent>() => {
  const agentContext = useContext(AgentContext)
  if (!agentContext) {
    throw new Error('useAgent must be used within a AgentContextProvider')
  }
  if (!agentContext.agent) {
    throw new Error('useAgent called before agent was initialized — use useOptionalAgent during bootstrap')
  }
  return agentContext as AgentContextInterface<AppAgent> & { agent: AppAgent }
}

export const useOptionalAgent = <AppAgent extends Agent>() => {
  const agentContext = useContext(AgentContext)
  if (!agentContext) {
    throw new Error('useOptionalAgent must be used within a AgentContextProvider')
  }
  return agentContext as AgentContextInterface<AppAgent>
}

interface Props {
  agent: Agent | undefined
}

const AgentProvider: React.FC<PropsWithChildren<Props>> = ({ agent, children }) => {
  const value = useMemo<AgentContextInterface>(() => ({ loading: agent == null, agent }), [agent])

  return (
    <AgentContext.Provider value={value}>
      <ConnectionProvider agent={agent}>
        <CredentialProvider agent={agent}>
          <ProofProvider agent={agent}>
            <CredentialFormatDataProvider agent={agent}>
              <ProofFormatDataProvider agent={agent}>
                <BasicMessageProvider agent={agent}>
                  <QuestionAnswerProvider agent={agent}>{children}</QuestionAnswerProvider>
                </BasicMessageProvider>
              </ProofFormatDataProvider>
            </CredentialFormatDataProvider>
          </ProofProvider>
        </CredentialProvider>
      </ConnectionProvider>
    </AgentContext.Provider>
  )
}

export default AgentProvider
