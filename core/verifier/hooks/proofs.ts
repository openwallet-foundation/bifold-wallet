import { ProofExchangeRecord } from '@aries-framework/core'
import { useProofs } from '@aries-framework/react-hooks'
import { useMemo } from 'react'

import { proofMetadata, ProofMetadata } from '../types/metadata'

export const useProofsByTemplateId = (templateId: string): ProofExchangeRecord[] => {
  const { records: proofs } = useProofs()

  return useMemo(
    () =>
      proofs.filter((proof: ProofExchangeRecord) => {
        const metadata = proof?.metadata.get(ProofMetadata.customMetadata) as proofMetadata
        if (metadata?.proof_request_template_id === templateId) {
          return proof
        }
      }),
    [proofs, templateId]
  )
}
