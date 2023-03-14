import {
  Agent,
  AgentMessage,
  AutoAcceptProof,
  ProofExchangeRecord,
  ProofRequest,
  V1RequestPresentationMessage,
} from '@aries-framework/core'

import { defaultProofRequestTemplates } from '../constants'
import {
  IndyRequestedAttribute,
  IndyRequestedPredicate,
  ProofRequestTemplate,
  ProofRequestType,
} from '../types/proof-reqeust-template'

const protocolVersion = 'v1'
const domain = 'http://aries-mobile-agent.com'

/*
 * Find Proof Request message in the storage by the given id
 * */
export const findProofRequestMessage = async (agent: Agent, id: string): Promise<ProofRequest | undefined> => {
  const message = await agent.proofs.findRequestMessage(id)
  if (message && message instanceof V1RequestPresentationMessage && message.indyProofRequest) {
    return message.indyProofRequest
  } else {
    return undefined
  }
}

/*
 * Find Proof Request template for provided id
 * */
export const getProofRequestTemplate = (id: string): ProofRequestTemplate | undefined => {
  return defaultProofRequestTemplates.find((template) => template.id === id)
}

/*
 * Build Proof Request data from for provided template
 * */
export const buildProofRequestDataForTemplate = (
  template: ProofRequestTemplate,
  customValues?: Record<string, Record<string, number>>
) => {
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
          const customValue =
            customValues && customValues[data.schema] ? customValues[data.schema][requestedPredicate.name] : undefined
          if (requestedPredicate.parameterizable && customValue) {
            requestedPredicates.set(`referent_${index}`, { ...requestedPredicate, predicateValue: customValue })
          } else {
            requestedPredicates.set(`referent_${index}`, requestedPredicate)
          }
          index++
        })
      }
    })
    return {
      indy: {
        name: template.name,
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

export const buildProofRequestDataForTemplateId = (
  templateId: string,
  customPredicateValues?: Record<string, Record<string, number>>
) => {
  const template = getProofRequestTemplate(templateId)
  if (!template) {
    return undefined
  }
  return buildProofRequestDataForTemplate(template, customPredicateValues)
}

export interface CreateProofRequestInvitationResult {
  request: AgentMessage
  proofRecord: ProofExchangeRecord
  invitation: AgentMessage
  invitationUrl: string
}

/*
 * Create connectionless proof request invitation for provided template
 * */
export const createConnectionlessProofRequestInvitation = async (
  agent: Agent,
  templateId: string,
  customPredicateValues?: Record<string, Record<string, number>>
): Promise<CreateProofRequestInvitationResult | undefined> => {
  const proofFormats = buildProofRequestDataForTemplateId(templateId, customPredicateValues)
  if (!proofFormats) {
    return undefined
  }
  const { message: request, proofRecord } = await agent.proofs.createRequest({
    protocolVersion,
    autoAcceptProof: AutoAcceptProof.Always,
    proofFormats,
  })
  const { message: invitation, invitationUrl } = await agent.oob.createLegacyConnectionlessInvitation({
    recordId: proofRecord.id,
    message: request,
    domain,
  })
  return {
    request,
    proofRecord,
    invitation,
    invitationUrl,
  }
}

export interface SendProofRequestResult {
  proofRecord: ProofExchangeRecord
}

/*
 * Build Proof Request for provided template and send it to provided connection
 * */
export const sendProofRequest = async (
  agent: Agent,
  templateId: string,
  connectionId: string,
  customPredicateValues?: Record<string, Record<string, number>>
): Promise<SendProofRequestResult | undefined> => {
  const proofFormats = buildProofRequestDataForTemplateId(templateId, customPredicateValues)
  if (!proofFormats) {
    return undefined
  }
  const proofRecord = await agent.proofs.requestProof({
    protocolVersion,
    connectionId,
    proofFormats,
  })
  return {
    proofRecord,
  }
}

/*
 * Check if the Proof Request template contains at least one predicate
 * */
export const hasPredicates = (record: ProofRequestTemplate): boolean => {
  if (record.payload.type === ProofRequestType.Indy) {
    return record.payload.data.some((d) => d.requestedPredicates && d.requestedPredicates?.length > 0)
  }
  if (record.payload.type === ProofRequestType.DIF) {
    return false
  }
  return false
}

/*
 * Check if the Proof Request template contains parameterizable predicates
 * */
export const isParameterizable = (record: ProofRequestTemplate): boolean => {
  if (record.payload.type === ProofRequestType.Indy) {
    return record.payload.data.some((d) => d.requestedPredicates?.some((predicate) => predicate.parameterizable))
  }
  if (record.payload.type === ProofRequestType.DIF) {
    return false
  }
  return false
}
