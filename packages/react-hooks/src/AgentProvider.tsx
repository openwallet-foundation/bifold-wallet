import type { Agent } from '@credo-ts/core'
import type { PropsWithChildren } from 'react'

import { QuestionAnswerModule } from '@credo-ts/question-answer'
import * as React from 'react'
import { createContext, useState, useContext } from 'react'

import BasicMessageProvider from './BasicMessageProvider'
import ConnectionProvider from './ConnectionProvider'
import CredentialFormatDataProvider from './CredentialFormatDataProvider'
import CredentialProvider from './CredentialProvider'
import ProofFormatDataProvider from './ProofFormatDataProvider'
import ProofProvider from './ProofProvider'
import QuestionAnswerProvider from './QuestionAnswerProvider'
import { useIsModuleRegistered } from './recordUtils'

interface AgentContextInterface<AppAgent extends Agent = Agent> {
  loading: boolean
  agent: AppAgent
}

const AgentContext = createContext<AgentContextInterface | undefined>(undefined)

export const useAgent = <AppAgent extends Agent>() => {
  const agentContext = useContext(AgentContext)
  if (!agentContext) {
    throw new Error('useAgent must be used within a AgentContextProvider')
  }
  return agentContext as AgentContextInterface<AppAgent>
}

interface Props {
  agent: Agent
}

const AgentProvider: React.FC<PropsWithChildren<Props>> = ({ agent, children }) => {
  const isQaRegistered = useIsModuleRegistered(agent, QuestionAnswerModule)
  const [agentState] = useState<AgentContextInterface>({
    loading: false,
    agent,
  })

  return (
    <AgentContext.Provider value={agentState}>
      <ConnectionProvider agent={agent}>
        <CredentialProvider agent={agent}>
          <ProofProvider agent={agent}>
            <CredentialFormatDataProvider agent={agent}>
              <ProofFormatDataProvider agent={agent}>
                <BasicMessageProvider agent={agent}>
                  {isQaRegistered ? (
                    <QuestionAnswerProvider agent={agent}>{children} </QuestionAnswerProvider>
                  ) : (
                    children
                  )}
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
