import { Agent, AgentMessage, AutoAcceptProof, ProofExchangeRecord } from '@aries-framework/core'

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
 * Find Proof Request template for provided id
 * */
export const getProofRequestTemplate = (id: string): ProofRequestTemplate | undefined => {
  return defaultProofRequestTemplates.find((template) => template.id === id)
}

/*
 * Build Proof Request data from for provided template
 * */
export const buildProofRequestDataForTemplate = (template: ProofRequestTemplate) => {
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

export const buildProofRequestDataForTemplateId = (templateId: string) => {
  const template = getProofRequestTemplate(templateId)
  if (!template) {
    return undefined
  }
  return buildProofRequestDataForTemplate(template)
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
  templateId: string
): Promise<CreateProofRequestInvitationResult | undefined> => {
  const proofFormats = buildProofRequestDataForTemplateId(templateId)
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
  connectionId: string
): Promise<SendProofRequestResult | undefined> => {
  const proofFormats = buildProofRequestDataForTemplateId(templateId)
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
