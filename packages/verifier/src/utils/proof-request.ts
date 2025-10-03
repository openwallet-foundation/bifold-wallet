import {
  AnonCredsRequestedAttribute,
  AnonCredsRequestedPredicate,
  LegacyIndyProofRequest,
  DidCommRequestPresentationV1Message,
} from '@credo-ts/anoncreds'
import { Agent } from '@credo-ts/core'

import { BifoldAgent } from '../types/agent'
import { ProofRequestTemplate, ProofRequestType } from '../types/proof-reqeust-template'

import { DidCommMessage, DidCommAutoAcceptProof, DidCommProofExchangeRecord } from '@credo-ts/didcomm'

const protocolVersion = 'v2'
const domain = 'http://aries-mobile-agent.com'

/*
 * Find Proof Request message in the storage by the given id
 * */
export const findProofRequestMessage = async (
  agent: Agent,
  id: string
): Promise<LegacyIndyProofRequest | undefined> => {
  const message = await agent.modules.proofs.findRequestMessage(id)
  if (message && message instanceof DidCommRequestPresentationV1Message && message.indyProofRequest) {
    return message.indyProofRequest
  } else {
    return undefined
  }
}

/*
 * Build Proof Request data from for provided template
 * */
/*
 * Build Proof Request data for provided template
 * */
export const buildProofRequestDataForTemplate = (
  template: ProofRequestTemplate,
  customValues?: Record<string, Record<string, number>>
) => {
  if (template.payload.type === ProofRequestType.AnonCreds) {
    const requestedAttributes: Record<string, AnonCredsRequestedAttribute> = {}
    const requestedPredicates: Record<string, AnonCredsRequestedPredicate> = {}
    let index = 0

    template.payload.data.forEach((data) => {
      if (data.requestedAttributes?.length) {
        data.requestedAttributes.forEach((requestedAttribute) => {
          requestedAttributes[`referent_${index}`] = {
            name: requestedAttribute.name,
            names: requestedAttribute.names,
            non_revoked: requestedAttribute.nonRevoked,
            restrictions: requestedAttribute.restrictions,
          }
          index++
        })
      }
      if (data.requestedPredicates?.length) {
        data.requestedPredicates.forEach((requestedPredicate) => {
          const customValue =
            customValues && customValues[data.schema] ? customValues[data.schema][requestedPredicate.name] : undefined

          requestedPredicates[`referent_${index}`] = {
            name: requestedPredicate.name,
            p_value:
              requestedPredicate.parameterizable && customValue ? customValue : requestedPredicate.predicateValue,
            p_type: requestedPredicate.predicateType,
            non_revoked: requestedPredicate.nonRevoked,
            restrictions: requestedPredicate.restrictions,
          }
          index++
        })
      }
    })
    return {
      anoncreds: {
        name: template.name,
        version: template.version,
        nonce: Date.now().toString(),
        requested_attributes: requestedAttributes,
        requested_predicates: requestedPredicates,
      },
    }
  }
  if (template.payload.type === ProofRequestType.DIF) {
    return {}
  }
}

export interface CreateProofRequestInvitationResult {
  request: DidCommMessage
  proofRecord: DidCommProofExchangeRecord
  invitation: DidCommMessage
  invitationUrl: string
}

/*
 * Create connectionless proof request invitation for provided template
 * */
export const createConnectionlessProofRequestInvitation = async (
  agent: BifoldAgent,
  template: ProofRequestTemplate,
  customPredicateValues?: Record<string, Record<string, number>>
): Promise<CreateProofRequestInvitationResult | undefined> => {
  const proofFormats = buildProofRequestDataForTemplate(template, customPredicateValues)
  if (!proofFormats) {
    return undefined
  }
  const { message: request, proofRecord } = await agent.modules.proofs.createRequest({
    protocolVersion,
    autoAcceptProof: DidCommAutoAcceptProof.Always,
    proofFormats,
  })
  const { message: invitation, invitationUrl } = await agent.modules.oob.createLegacyConnectionlessInvitation({
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
  proofRecord: DidCommProofExchangeRecord
}

/*
 * Build Proof Request for provided template and send it to provided connection
 * */
export const sendProofRequest = async (
  agent: BifoldAgent,
  template: ProofRequestTemplate,
  connectionId: string,
  customPredicateValues?: Record<string, Record<string, number>>
): Promise<SendProofRequestResult | undefined> => {
  const proofFormats = buildProofRequestDataForTemplate(template, customPredicateValues)
  if (!proofFormats) {
    return undefined
  }
  const proofRecord = await agent.modules.proofs.requestProof({
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
  if (record.payload.type === ProofRequestType.AnonCreds) {
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
  if (record.payload.type === ProofRequestType.AnonCreds) {
    return record.payload.data.some((d) => d.requestedPredicates?.some((predicate) => predicate.parameterizable))
  }
  if (record.payload.type === ProofRequestType.DIF) {
    return false
  }
  return false
}
