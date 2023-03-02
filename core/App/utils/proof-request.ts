import { ProofRequestTemplate, ProofRequestType } from '../types/proof-reqeust-template'

export const buildProofRequestFromTemplate = (template: ProofRequestTemplate) => {
  if (template.payload.type === ProofRequestType.Indy) {
    return {
      indy: {
        name: template.title,
        version: template.version,
        nonce: Date.now(),
        requestedAttributes: template.payload.data.flatMap((item) => item.requestedAttributes),
        requestedPredicates: template.payload.data.flatMap((item) => item.requestedPredicates),
      },
    }
  }
  if (template.payload.type === ProofRequestType.DIF) {
    return {}
  }
}
