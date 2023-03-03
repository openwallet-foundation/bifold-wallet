import { defaultProofRequestTemplates } from '../constants'
import {
  IndyRequestedAttribute,
  IndyRequestedPredicate,
  ProofRequestTemplate,
  ProofRequestType,
} from '../types/proof-reqeust-template'

export const buildProofRequestDataByTemplate = (template: ProofRequestTemplate) => {
  if (template.payload.type === ProofRequestType.Indy) {
    const requestedAttributes: Map<string, IndyRequestedAttribute> = new Map()
    const requestedPredicates: Map<string, IndyRequestedPredicate> = new Map()
    let index = 0

    template.payload.data.forEach((data) => {
      if (data.requestedAttributes?.length) {
        data.requestedAttributes.forEach((requestedAttribute) => {
          requestedAttributes.set(`referent_${index}`, requestedAttribute)
          index++
        })
      }
      if (data.requestedPredicates?.length) {
        data.requestedPredicates.forEach((requestedPredicate) => {
          requestedPredicates.set(`referent_${index}`, requestedPredicate)
          index++
        })
      }
    })
    return {
      indy: {
        name: template.title,
        version: template.version,
        nonce: Date.now().toString(),
        requestedAttributes,
        requestedPredicates,
      },
    }
  }
  if (template.payload.type === ProofRequestType.DIF) {
    return {}
  }
}

export const buildProofRequestDataByTemplateId = (id: string) => {
  const template = defaultProofRequestTemplates.find((template) => template.id === id)
  if (!template) {
    return null
  }
  return buildProofRequestDataByTemplate(template)
}
