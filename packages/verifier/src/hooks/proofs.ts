import { useProofs } from '@credo-ts-ext/react-hooks'
import { ProofExchangeRecord } from '@credo-ts/core'
import { useMemo } from 'react'

import { ProofCustomMetadata, ProofMetadata } from '../types/metadata'

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
