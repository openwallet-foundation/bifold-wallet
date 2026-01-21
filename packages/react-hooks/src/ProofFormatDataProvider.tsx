import type { Agent } from '@credo-ts/core'
import type { Awaited } from '@credo-ts/core/build/types'
import type { PropsWithChildren } from 'react'

import { ProofExchangeRecord } from '@credo-ts/core'
import { useState, createContext, useContext, useEffect } from 'react'
import * as React from 'react'

import { recordsAddedByType, recordsRemovedByType, recordsUpdatedByType } from './recordUtils'

type FormatReturn = Awaited<ReturnType<Agent['proofs']['getFormatData']>>

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

const removeRecord = (record: ProofExchangeRecord, state: FormattedProofDataState): FormattedProofDataState => {
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

  const setInitialState = async () => {
    const records = await agent.proofs.getAll()
    const formattedData: Array<ProofFormatData> = []
    for (const record of records) {
      const formatData = await agent.proofs.getFormatData(record.id)
      formattedData.push({ ...formatData, id: record.id })
    }
    setState({ formattedData, loading: false })
  }

  useEffect(() => {
    void setInitialState()
  }, [agent])

  useEffect(() => {
    if (state.loading) return

    const proofAdded$ = recordsAddedByType(agent, ProofExchangeRecord).subscribe(async (record) => {
      const formatData = await agent.proofs.getFormatData(record.id)
      setState(addRecord({ ...formatData, id: record.id }, state))
    })

    const proofUpdate$ = recordsUpdatedByType(agent, ProofExchangeRecord).subscribe(async (record) => {
      const formatData = await agent.proofs.getFormatData(record.id)
      setState(updateRecord({ ...formatData, id: record.id }, state))
    })

    const proofRemove$ = recordsRemovedByType(agent, ProofExchangeRecord).subscribe((record) =>
      setState(removeRecord(record, state)),
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
