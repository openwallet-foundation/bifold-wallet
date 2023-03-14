import { ProofExchangeRecord } from '@aries-framework/core'
import { useProofs } from '@aries-framework/react-hooks'
import { useMemo } from 'react'

import { ProofMetadata, ProofCustomMetadata } from '../types/metadata'

export const useProofsByTemplateId = (templateId: string): ProofExchangeRecord[] => {
  const { records: proofs } = useProofs()

  return useMemo(
    () =>
      proofs.filter((proof: ProofExchangeRecord) => {
        const metadata = proof?.metadata.get(ProofMetadata.customMetadata) as ProofCustomMetadata
        if (metadata?.proof_request_template_id === templateId) {
          return proof
        }
      }),
    [proofs, templateId]
  )
}
