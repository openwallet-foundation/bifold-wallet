import type { Agent } from '@credo-ts/core'
import type { PropsWithChildren } from 'react'
import { DidCommProofExchangeRecord } from '@credo-ts/didcomm'
import { useState, createContext, useContext, useEffect, useCallback } from 'react'
import * as React from 'react'

import { recordsAddedByType, recordsRemovedByType, recordsUpdatedByType } from './recordUtils'
import { BifoldAgent } from './agent'

type FormatReturn = Awaited<ReturnType<BifoldAgent['didcomm']['proofs']['getFormatData']>>

export type ProofFormatData = FormatReturn & { id: string }

type FormattedProofDataState = {
  formattedData: Array<ProofFormatData>
  loading: boolean
}

const addRecord = (record: ProofFormatData, state: FormattedProofDataState): FormattedProofDataState => {
  const newRecordsState = [...state.formattedData]
  newRecordsState.unshift(record)

  return {
    loading: state.loading,
    formattedData: newRecordsState,
  }
}

const updateRecord = (record: ProofFormatData, state: FormattedProofDataState): FormattedProofDataState => {
  const newRecordsState = [...state.formattedData]
  const index = newRecordsState.findIndex((r) => r.id === record.id)

  if (index > -1) {
    newRecordsState[index] = record
  }

  return {
    loading: state.loading,
    formattedData: newRecordsState,
  }
}

const removeRecord = (record: DidCommProofExchangeRecord, state: FormattedProofDataState): FormattedProofDataState => {
  const newRecordsState = state.formattedData.filter((r) => r.id !== record.id)

  return {
    loading: state.loading,
    formattedData: newRecordsState,
  }
}

const ProofFormatDataContext = createContext<FormattedProofDataState | undefined>(undefined)

export const useProofsFormatData = () => {
  const proofFormatDataContext = useContext(ProofFormatDataContext)

  if (!proofFormatDataContext) {
    throw new Error('useProofFormatData must be used within a ProofFormatDataContextProvider')
  }

  return proofFormatDataContext
}

export const useProofFormatDataById = (id: string): ProofFormatData | undefined => {
  const { formattedData } = useProofsFormatData()
  return formattedData.find((c) => c.id === id)
}

interface Props {
  agent: Agent
}

const ProofFormatDataProvider: React.FC<PropsWithChildren<Props>> = ({ agent, children }) => {
  const [state, setState] = useState<{
    formattedData: Array<ProofFormatData>
    loading: boolean
  }>({
    formattedData: [],
    loading: true,
  })

  const setInitialState = useCallback(async () => {
    const records = await agent.didcomm.proofs.getAll()
    const formattedData: Array<ProofFormatData> = []
    for (const record of records) {
      const formatData = await agent.didcomm.proofs.getFormatData(record.id)
      formattedData.push({ ...formatData, id: record.id })
    }
    setState({ formattedData, loading: false })
  }, [agent])

  useEffect(() => {
    void setInitialState()
  }, [setInitialState])

  useEffect(() => {
    if (state.loading) return

    const proofAdded$ = recordsAddedByType(agent, DidCommProofExchangeRecord).subscribe(async (record) => {
      const formatData = await agent.didcomm.proofs.getFormatData(record.id)
      setState(addRecord({ ...formatData, id: record.id }, state))
    })

    const proofUpdate$ = recordsUpdatedByType(agent, DidCommProofExchangeRecord).subscribe(async (record) => {
      const formatData = await agent.didcomm.proofs.getFormatData(record.id)
      setState(updateRecord({ ...formatData, id: record.id }, state))
    })

    const proofRemove$ = recordsRemovedByType(agent, DidCommProofExchangeRecord).subscribe((record) =>
      setState(removeRecord(record, state))
    )

    return () => {
      proofAdded$.unsubscribe()
      proofUpdate$.unsubscribe()
      proofRemove$.unsubscribe()
    }
  }, [state, agent])

  return <ProofFormatDataContext.Provider value={state}>{children}</ProofFormatDataContext.Provider>
}

export default ProofFormatDataProvider
