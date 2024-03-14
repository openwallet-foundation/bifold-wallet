import {
  AnonCredsCredentialInfo,
  AnonCredsHolderService,
  AnonCredsHolderServiceSymbol,
  AnonCredsProofRequest,
  AnonCredsProofRequestRestriction,
  AnonCredsRequestedAttribute,
  AnonCredsRequestedPredicate,
} from '@credo-ts/anoncreds'
import { AnonCredsCredentialTags, getAnonCredsTagsFromRecord } from '@credo-ts/anoncreds/build/utils/w3cAnonCredsUtils'
import {
  AgentContext,
  DifPexCredentialsForRequest,
  DifPresentationExchangeDefinition,
  DifPresentationExchangeDefinitionV2,
  W3cCredentialRecord,
} from '@credo-ts/core'
import { uuid } from '@credo-ts/core/build/utils/uuid'

import { ProofCredentialAttributes, ProofCredentialPredicates } from '../types/proof-items'

export type RecordWithMetadata = {
  record: W3cCredentialRecord
  anonCredsTags: AnonCredsCredentialTags
  credentialInfo: AnonCredsCredentialInfo
}
export type DescriptorMetadata = { [key: string]: RecordWithMetadata[] }

export interface DifPexAnonCredsProofRequest extends AnonCredsProofRequest {
  requested_attributes: Record<string, AnonCredsRequestedAttribute & { descriptorId?: string }>
  requested_predicates: Record<string, AnonCredsRequestedPredicate & { descriptorId?: string }>
}

type FieldV2 = NonNullable<
  DifPresentationExchangeDefinitionV2['input_descriptors'][number]['constraints']['fields']
>[number]

const getPredicateTypeAndValues = (predicateFilter: NonNullable<FieldV2['filter']>) => {
  const predicates: {
    predicateType: AnonCredsRequestedPredicate['p_type']
    predicateValue: AnonCredsRequestedPredicate['p_value']
  }[] = []

  const supportedJsonSchemaNumericRangeProperties: Record<string, AnonCredsRequestedPredicate['p_type']> = {
    exclusiveMinimum: '>',
    exclusiveMaximum: '<',
    minimum: '>=',
    maximum: '<=',
  }

  for (const [key, value] of Object.entries(predicateFilter)) {
    if (key === 'type') continue

    const predicateType = supportedJsonSchemaNumericRangeProperties[key]
    if (!predicateType) throw new Error(`Unsupported predicate filter property '${key}'`)
    predicates.push({ predicateType, predicateValue: value })
  }

  return predicates
}

const getClaimNameForField = (field: FieldV2) => {
  if (!field.path) throw new Error('Field path is required')
  const baseClaimPath = '$.credentialSubject.'
  const claimPaths = field.path.filter((path) => path.startsWith(baseClaimPath))
  if (claimPaths.length === 0) return undefined

  const claimNames = claimPaths.map((path) => path.slice(baseClaimPath.length))
  const propertyName = claimNames[0]

  return propertyName
}

export type ProcessedAttributes = { [key: string]: ProofCredentialAttributes }
export type ProcessedPredicates = { [key: string]: ProofCredentialPredicates }

export const createAnonCredsProofRequest = async (
  presentationDefinition: DifPresentationExchangeDefinition,
  descriptorMetadata: DescriptorMetadata
) => {
  const anonCredsProofRequest: DifPexAnonCredsProofRequest = {
    version: '1.0',
    name: presentationDefinition.name ?? 'Proof request',
    nonce: uuid(),
    requested_attributes: {},
    requested_predicates: {},
  }

  const nonRevokedTime = Math.floor(Date.now() / 1000)
  const nonRevokedInterval = { from: nonRevokedTime, to: nonRevokedTime }

  for (const descriptor of presentationDefinition.input_descriptors) {
    const referent = descriptor.id
    const attributeReferent = `${referent}_attribute`
    const predicateReferentBase = `${referent}_predicate`
    let predicateReferentIndex = 0

    const fields = descriptor.constraints?.fields
    if (!fields) throw new Error('Unclear mapping of constraint with no fields.')

    // Setting `requiresRevocationStatus` to `false` returns all
    // credentials even if they are revokable (and revoked). We need this to
    // be able to show why a proof cannot be satisfied. Otherwise we can only
    // show failure.
    const requiresRevocationStatus = false

    const credentialMeta = descriptorMetadata[descriptor.id]
    const restrictions: AnonCredsProofRequestRestriction[] = credentialMeta.map((credentialMeta) => {
      return {
        cred_def_id: credentialMeta.anonCredsTags.anonCredsCredentialDefinitionId,
        schema_id: credentialMeta.anonCredsTags.anonCredsSchemaId,
      }
    })

    for (const field of fields) {
      const propertyName = getClaimNameForField(field)
      if (!propertyName) continue

      if (field.predicate) {
        if (!field.filter) throw new Error('Missing required predicate filter property.')
        const predicateTypeAndValues = getPredicateTypeAndValues(field.filter)
        for (const { predicateType, predicateValue } of predicateTypeAndValues) {
          const predicateReferent = `${predicateReferentBase}_${predicateReferentIndex++}`
          anonCredsProofRequest.requested_predicates[predicateReferent] = {
            name: propertyName,
            p_type: predicateType,
            p_value: predicateValue,
            restrictions,
            non_revoked: requiresRevocationStatus ? nonRevokedInterval : undefined,
            descriptorId: descriptor.id,
          }
        }
      } else {
        if (!anonCredsProofRequest.requested_attributes[attributeReferent]) {
          anonCredsProofRequest.requested_attributes[attributeReferent] = {
            names: [propertyName],
            restrictions,
            non_revoked: requiresRevocationStatus ? nonRevokedInterval : undefined,
            descriptorId: descriptor.id,
          }
        } else {
          const names = anonCredsProofRequest.requested_attributes[attributeReferent].names ?? []
          anonCredsProofRequest.requested_attributes[attributeReferent].names = [...names, propertyName]
        }
      }
    }
  }

  return anonCredsProofRequest
}

export const getDescriptorMetadata = async (
  agentContext: AgentContext,
  credentialsForRequest: DifPexCredentialsForRequest
) => {
  const descriptorMetadata: DescriptorMetadata = {}

  for (const requestedAttribute of Object.values(credentialsForRequest.requirements)) {
    for (const entry of requestedAttribute.submissionEntry) {
      const inputDescriptorId = entry.inputDescriptorId

      const recordsWithMetadata = await Promise.all(
        entry.verifiableCredentials.map(async (record) => {
          const anonCredsTags = getAnonCredsTagsFromRecord(record as W3cCredentialRecord)
          if (!anonCredsTags) throw new Error('Missing AnonCreds tags from credential record')
          const holderService =
            agentContext.dependencyManager.resolve<AnonCredsHolderService>(AnonCredsHolderServiceSymbol)
          const credentialInfo = await holderService.getCredential(agentContext, { id: record.id })
          return { record: record as W3cCredentialRecord, anonCredsTags, credentialInfo }
        })
      )

      if (!descriptorMetadata[inputDescriptorId]) descriptorMetadata[inputDescriptorId] = []

      for (const recordWithMetadata of recordsWithMetadata) {
        if (!descriptorMetadata[inputDescriptorId].find((item) => item.record.id === recordWithMetadata.record.id)) {
          descriptorMetadata[inputDescriptorId].push(recordWithMetadata)
        }
      }
    }
  }

  return descriptorMetadata
}
