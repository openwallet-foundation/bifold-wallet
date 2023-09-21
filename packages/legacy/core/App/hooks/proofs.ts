import { ProofExchangeRecord } from '@aries-framework/core'
import { useAgent, useCredentials, useProofById, useProofs } from '@aries-framework/react-hooks'
import { useMemo } from 'react'
import { retrieveCredentialsForProof } from '../utils/helpers'
import { useTranslation } from 'react-i18next'

export const useProofsByConnectionId = (connectionId: string): ProofExchangeRecord[] => {
  const { records: proofs } = useProofs()
  return useMemo(
    () => proofs.filter((proof: ProofExchangeRecord) => proof.connectionId === connectionId),
    [proofs, connectionId]
  )
}

export const getAllCredentialsForProof = (proofId: string) => {
  const { t } = useTranslation()
  const { agent } = useAgent()
  const fullCredentials = useCredentials().records
  const proof = useProofById(proofId)
  return useMemo(
    () => {
      if (!proof || !agent) {
        return
      }
      return retrieveCredentialsForProof(agent, proof, fullCredentials, t, true)
    }, [proofId]
  )
}
