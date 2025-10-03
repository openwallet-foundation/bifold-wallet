
import { useProofs } from '@credo-ts/react-hooks'
import { useMemo } from 'react'

import { ProofCustomMetadata, ProofMetadata } from '../types/metadata'
import { DidCommProofExchangeRecord } from '@credo-ts/didcomm'

export const useProofsByTemplateId = (templateId: string): DidCommProofExchangeRecord[] => {
  const { records: proofs } = useProofs()

  return useMemo(
    () =>
      proofs.filter((proof: DidCommProofExchangeRecord) => {
        const metadata = proof?.metadata.get(ProofMetadata.customMetadata) as ProofCustomMetadata
        if (metadata?.proof_request_template_id === templateId) {
          return proof
        }
      }),
    [proofs, templateId]
  )
}
