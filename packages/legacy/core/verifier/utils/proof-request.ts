import {
  Agent,
  AgentMessage,
  AttributeFilter,
  AttributeValue,
  AutoAcceptProof,
  ProofAttributeInfo,
  ProofExchangeRecord,
  ProofPredicateInfo,
  ProofRequest,
  V1RequestPresentationMessage,
} from '@aries-framework/core'

import { ProofRequestTemplate, ProofRequestType } from '../types/proof-reqeust-template'

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

const convertCase: { [key: string]: keyof AttributeFilter | undefined } = {
  schema_id: 'schemaId',
  schema_issuer_did: 'schemaIssuerDid',
  schema_name: 'schemaName',
  schema_version: 'schemaVersion',
  issuer_did: 'issuerDid',
  cred_def_id: 'credentialDefinitionId',
}

const fromAnonCreds = (restriction: Record<string, string>): AttributeFilter => {
  const restrictionObject = {} as AttributeFilter
  Object.keys(restriction).forEach((anonKey) => {
    if (anonKey.startsWith('attr::') && anonKey.endsWith('::value')) {
      restrictionObject.attributeValue = new AttributeValue({
        name: anonKey.split('::')[1],
        value: restriction[anonKey],
      })
    } else {
      const key = convertCase[anonKey]
      if (key) {
        restrictionObject[key] = restriction[anonKey] as any
      }
    }
  })
  return restrictionObject
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
  if (template.payload.type === ProofRequestType.Indy) {
    const requestedAttributes: Map<string, ProofAttributeInfo> = new Map()
    const requestedPredicates: Map<string, ProofPredicateInfo> = new Map()
    let index = 0

    template.payload.data.forEach((data) => {
      if (data.requestedAttributes?.length) {
        data.requestedAttributes.forEach((requestedAttribute) => {
          const attribute = new ProofAttributeInfo({
            name: requestedAttribute.name,
            names: requestedAttribute.names,
            nonRevoked: requestedAttribute.nonRevoked,
            restrictions: requestedAttribute.restrictions?.map((restriction) => fromAnonCreds(restriction)),
          })
          requestedAttributes.set(`referent_${index}`, attribute)
          index++
        })
      }
      if (data.requestedPredicates?.length) {
        data.requestedPredicates.forEach((requestedPredicate) => {
          const customValue =
            customValues && customValues[data.schema] ? customValues[data.schema][requestedPredicate.name] : undefined

          const predicate = new ProofPredicateInfo({
            name: requestedPredicate.name,
            predicateValue:
              requestedPredicate.parameterizable && customValue ? customValue : requestedPredicate.predicateValue,
            predicateType: requestedPredicate.predicateType,
            nonRevoked: requestedPredicate.nonRevoked,
            restrictions: requestedPredicate.restrictions?.map((restriction) => fromAnonCreds(restriction)),
          })

          requestedPredicates.set(`referent_${index}`, predicate)
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
  template: ProofRequestTemplate,
  customPredicateValues?: Record<string, Record<string, number>>
): Promise<CreateProofRequestInvitationResult | undefined> => {
  const proofFormats = buildProofRequestDataForTemplate(template, customPredicateValues)
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
  template: ProofRequestTemplate,
  connectionId: string,
  customPredicateValues?: Record<string, Record<string, number>>
): Promise<SendProofRequestResult | undefined> => {
  const proofFormats = buildProofRequestDataForTemplate(template, customPredicateValues)
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
