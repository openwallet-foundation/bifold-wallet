import {
  IndyRequestedAttribute,
  IndyRequestedPredicate,
  ProofRequestTemplate,
  ProofRequestType,
} from '../types/proof-reqeust-template'

export const buildProofRequestFromTemplate = (template: ProofRequestTemplate) => {
  if (template.payload.type === ProofRequestType.Indy) {
    const requestedAttributes: Array<IndyRequestedAttribute> = []
    const requestedPredicates: Array<IndyRequestedPredicate> = []

    template.payload.data.forEach((data) => {
      if (data.requestedAttributes?.length) {
        requestedAttributes.push(...data.requestedAttributes)
      }
      if (data.requestedPredicates?.length) {
        requestedPredicates.push(...data.requestedPredicates)
      }
    })
    return {
      indy: {
        name: template.title,
        version: template.version,
        nonce: Date.now(),
        requestedAttributes,
        requestedPredicates,
      },
    }
  }
  if (template.payload.type === ProofRequestType.DIF) {
    return {}
  }
}
