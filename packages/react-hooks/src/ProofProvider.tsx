import type { RecordsState } from './recordUtils'
import type { Agent, ProofState } from '@credo-ts/core'
import type { PropsWithChildren } from 'react'

import { ProofExchangeRecord } from '@credo-ts/core'
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

const ProofContext = createContext<RecordsState<ProofExchangeRecord> | undefined>(undefined)

export const useProofs = () => {
  const proofContext = useContext(ProofContext)
  if (!proofContext) {
    throw new Error('useProofs must be used within a ProofContextProvider')
  }
  return proofContext
}

export const useProofsByConnectionId = (connectionId: string): ProofExchangeRecord[] => {
  const { records: proofs } = useProofs()
  return useMemo(
    () => proofs.filter((proof: ProofExchangeRecord) => proof.connectionId === connectionId),
    [proofs, connectionId]
  )
}

export const useProofById = (id: string): ProofExchangeRecord | undefined => {
  const { records: proofs } = useProofs()
  return proofs.find((p: ProofExchangeRecord) => p.id === id)
}

export const useProofByState = (state: ProofState | ProofState[]): ProofExchangeRecord[] => {
  const states = useMemo(() => (typeof state === 'string' ? [state] : state), [state])

  const { records: proofs } = useProofs()

  const filteredProofs = useMemo(
    () =>
      proofs.filter((r: ProofExchangeRecord) => {
        if (states.includes(r.state)) return r
      }),
    [proofs, states]
  )

  return filteredProofs
}

export const useProofNotInState = (state: ProofState | ProofState[]): ProofExchangeRecord[] => {
  const states = useMemo(() => (typeof state === 'string' ? [state] : state), [state])

  const { records: proofs } = useProofs()

  const filteredProofs = useMemo(
    () =>
      proofs.filter((r: ProofExchangeRecord) => {
        if (!states.includes(r.state)) return r
      }),
    [proofs, states]
  )

  return filteredProofs
}

interface Props {
  agent: Agent
}

const ProofProvider: React.FC<PropsWithChildren<Props>> = ({ agent, children }) => {
  const [state, setState] = useState<RecordsState<ProofExchangeRecord>>({
    records: [],
    loading: true,
  })

  const setInitialState = useCallback(async () => {
    const records = await agent.proofs.getAll()
    setState({ records, loading: false })
  }, [agent])

  useEffect(() => {
    setInitialState()
  }, [setInitialState])

  useEffect(() => {
    if (state.loading) return

    const proofAdded$ = recordsAddedByType(agent, ProofExchangeRecord).subscribe((record) =>
      setState(addRecord(record, state))
    )

    const proofUpdated$ = recordsUpdatedByType(agent, ProofExchangeRecord).subscribe((record) =>
      setState(updateRecord(record, state))
    )

    const proofRemoved$ = recordsRemovedByType(agent, ProofExchangeRecord).subscribe((record) =>
      setState(removeRecord(record, state))
    )

    return () => {
      proofAdded$?.unsubscribe()
      proofUpdated$?.unsubscribe()
      proofRemoved$?.unsubscribe()
    }
  }, [state, agent])

  return <ProofContext.Provider value={state}>{children}</ProofContext.Provider>
}

export default ProofProvider
