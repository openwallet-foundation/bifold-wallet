import type { RecordsState } from './recordUtils'
import type { Agent, BaseRecord } from '@credo-ts/core'
import type { PropsWithChildren } from 'react'

import { useState, createContext, useContext, useEffect } from 'react'
import * as React from 'react'

import { useBasicMessages, useBasicMessagesByConnectionId } from './BasicMessageProvider'
import { useCredentialsByConnectionId, useCredentials } from './CredentialProvider'
import { useProofsByConnectionId, useProofs } from './ProofProvider'

const ExchangesContext = createContext<RecordsState<BaseRecord> | undefined>(undefined)

export const useExchanges = () => {
  const exchangesContext = useContext(ExchangesContext)
  if (!ExchangesContext) {
    throw new Error('useExchanges must be used within a ExchangesContextProvider')
  }
  return exchangesContext
}

export const useExchangesByConnectionId = (connectionId: string): BaseRecord[] | undefined => {
  const basicMessages = useBasicMessagesByConnectionId(connectionId)
  const proofMessages = useProofsByConnectionId(connectionId)
  const credentialMessages = useCredentialsByConnectionId(connectionId)

  return [...basicMessages, ...proofMessages, ...credentialMessages] as BaseRecord[]
}

interface Props {
  agent: Agent
}

const ExchangesProvider: React.FC<PropsWithChildren<Props>> = ({ agent, children }) => {
  const [state, setState] = useState<RecordsState<BaseRecord>>({
    records: [],
    loading: true,
  })

  const setInitialState = () => {
    const { records: basicMessages } = useBasicMessages()
    const { records: proofs } = useProofs()
    const { records: credentials } = useCredentials()
    const records = [...basicMessages, ...proofs, ...credentials] as BaseRecord[]
    setState({ records, loading: false })
  }

  useEffect(() => {
    setInitialState()
  }, [agent])

  return <ExchangesContext.Provider value={state}>{children}</ExchangesContext.Provider>
}

export default ExchangesProvider
