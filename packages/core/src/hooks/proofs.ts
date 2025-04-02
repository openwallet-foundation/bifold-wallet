import { ProofExchangeRecord } from '@credo-ts/core'
import { useAgent, useCredentials, useProofById, useProofs } from '@credo-ts/react-hooks'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { TOKENS, useServices } from '../container-api'
import { retrieveCredentialsForProof } from '../utils/helpers'

export const useProofsByConnectionId = (connectionId: string): ProofExchangeRecord[] => {
  const { records: proofs } = useProofs()

  return useMemo(
    () => proofs.filter((proof: ProofExchangeRecord) => proof.connectionId === connectionId),
    [proofs, connectionId]
  )
}

export const useAllCredentialsForProof = (proofId: string) => {
  const { t } = useTranslation()
  const { agent } = useAgent()
  const fullCredentials = useCredentials().records
  const proof = useProofById(proofId)
  const [groupByReferent] = useServices([TOKENS.GROUP_BY_REFERENT])

  return useMemo(() => {
    if (!proof || !agent) {
      return
    }

    return retrieveCredentialsForProof(agent, proof, fullCredentials, t, groupByReferent)
  }, [proof, agent, fullCredentials, t, groupByReferent])
}
