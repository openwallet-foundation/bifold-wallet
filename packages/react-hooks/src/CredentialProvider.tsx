import type { RecordsState } from './recordUtils'
import type { Agent } from '@credo-ts/core'
import type { PropsWithChildren } from 'react'
import { DidCommCredentialExchangeRecord, DidCommCredentialState } from '@credo-ts/didcomm'
import { useState, createContext, useContext, useEffect, useMemo, useCallback } from 'react'
import * as React from 'react'

import {
  recordsRemovedByType,
  recordsUpdatedByType,
  recordsAddedByType,
  removeRecord,
  updateRecord,
  addRecord,
} from './recordUtils'

const CredentialContext = createContext<RecordsState<DidCommCredentialExchangeRecord> | undefined>(undefined)

export const useCredentials = () => {
  const credentialContext = useContext(CredentialContext)
  if (!credentialContext) {
    throw new Error('useCredentials must be used within a CredentialContextProvider')
  }
  return credentialContext
}

export const useCredentialsByConnectionId = (connectionId: string): DidCommCredentialExchangeRecord[] => {
  const { records: credentials } = useCredentials()
  return useMemo(
    () => credentials.filter((credential: DidCommCredentialExchangeRecord) => credential.connectionId === connectionId),
    [credentials, connectionId],
  )
}

export const useCredentialById = (id: string): DidCommCredentialExchangeRecord | undefined => {
  const { records: credentials } = useCredentials()
  return credentials.find((c: DidCommCredentialExchangeRecord) => c.id === id)
}

export const useCredentialByState = (state: DidCommCredentialState | DidCommCredentialState[]): DidCommCredentialExchangeRecord[] => {
  const states = useMemo(() => (typeof state === 'string' ? [state] : state), [state])

  const { records: credentials } = useCredentials()

  const filteredCredentials = useMemo(
    () => credentials.filter((r: DidCommCredentialExchangeRecord) => states.includes(r.state)),
    [credentials, states],
  )
  return filteredCredentials
}

export const useCredentialNotInState = (state: DidCommCredentialState | DidCommCredentialState[]) => {
  const states = useMemo(() => (typeof state === 'string' ? [state] : state), [state])

  const { records: credentials } = useCredentials()

  const filteredCredentials = useMemo(
    () => credentials.filter((r: DidCommCredentialExchangeRecord) => !states.includes(r.state)),
    [credentials, states],
  )

  return filteredCredentials
}

interface Props {
  agent: Agent
}

const CredentialProvider: React.FC<PropsWithChildren<Props>> = ({ agent, children }) => {
  const [state, setState] = useState<RecordsState<DidCommCredentialExchangeRecord>>({
    records: [],
    loading: true,
  })

  const setInitialState = useCallback(async () => {
    const records = await agent.modules.didcomm.credentials.getAll()
    setState({ records, loading: false })
  }, [agent])

  useEffect(() => {
    setInitialState()
  }, [setInitialState])

  useEffect(() => {
    if (state.loading) return

    const credentialAdded$ = recordsAddedByType(agent, DidCommCredentialExchangeRecord).subscribe((record) =>
      setState(addRecord(record, state)),
    )

    const credentialUpdated$ = recordsUpdatedByType(agent, DidCommCredentialExchangeRecord).subscribe((record) =>
      setState(updateRecord(record, state)),
    )

    const credentialRemoved$ = recordsRemovedByType(agent, DidCommCredentialExchangeRecord).subscribe((record) =>
      setState(removeRecord(record, state)),
    )

    return () => {
      credentialAdded$?.unsubscribe()
      credentialUpdated$?.unsubscribe()
      credentialRemoved$?.unsubscribe()
    }
  }, [state, agent])

  return <CredentialContext.Provider value={state}>{children}</CredentialContext.Provider>
}

export default CredentialProvider
