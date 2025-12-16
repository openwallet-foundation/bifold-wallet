import {
  AnonCredsCredentialTags,
  AnonCredsCredentialsForProofRequest,
  AnonCredsProofRequest,
  AnonCredsProofRequestRestriction,
  AnonCredsRequestedAttribute,
  AnonCredsRequestedPredicate,
  getAnonCredsTagsFromRecord,
} from '@credo-ts/anoncreds'
import {
  ClaimFormat,
  DifPexCredentialsForRequest,
  DifPresentationExchangeDefinition,
  DifPresentationExchangeDefinitionV2,
  W3cCredentialRecord,
} from '@credo-ts/core'

import { ProofCredentialAttributes, ProofCredentialPredicates } from '../types/proof-items'
import { GenericCredentialExchangeRecord } from 'types/credentials'

export type RecordWithMetadata = {
  record: W3cCredentialRecord
  anonCredsTags: AnonCredsCredentialTags
}
export type DescriptorMetadata = { [key: string]: RecordWithMetadata[] }

export interface DifPexAnonCredsProofRequest extends AnonCredsProofRequest {
  requested_attributes: Record<string, AnonCredsRequestedAttribute & { descriptorId?: string }>
  requested_predicates: Record<string, AnonCredsRequestedPredicate & { descriptorId?: string }>
}

type FieldV2 = NonNullable<
  DifPresentationExchangeDefinitionV2['input_descriptors'][number]['constraints']['fields']
>[number] // This type seems to be a bit broken now for some reason

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
    predicates.push({ predicateType, predicateValue: value as number })
  }

  return predicates
}

const getClaimNameForField = (field: FieldV2) => {
  if (!field.path) throw new Error('Field path is required')
  const baseClaimPaths = ['$.vc.credentialSubject.', '$.credentialSubject.']

  for (const baseClaimPath of baseClaimPaths) {
    const claimPaths = field.path.filter((path) => path.startsWith(baseClaimPath))
    if (claimPaths.length > 0) {
      const claimNames = claimPaths.map((path) => path.slice(baseClaimPath.length))
      return claimNames[0]
    }
  }

  return undefined
}

export type ProcessedAttributes = { [key: string]: ProofCredentialAttributes }
export type ProcessedPredicates = { [key: string]: ProofCredentialPredicates }

export const createAnonCredsProofRequest = (
  presentationDefinition: DifPresentationExchangeDefinition,
  descriptorMetadata: DescriptorMetadata
) => {
  const anonCredsProofRequest: AnonCredsProofRequest = {
    name: presentationDefinition.name ?? 'proof_request',
    version: '1.0',
    nonce: 'nonce',
    requested_attributes: {},
    requested_predicates: {},
  }

  const nonRevokedTime = Math.floor(Date.now() / 1000)
  const nonRevokedInterval = { from: nonRevokedTime, to: nonRevokedTime }

  for (const descriptor of presentationDefinition.input_descriptors) {
    const referent = descriptor.id
    let predicateReferentIndex = 0

    const fields = descriptor.constraints?.fields
    if (!fields) throw new Error('Unclear mapping of constraint with no fields.')
    const requiresRevocationStatus = false

    const credentialMeta = descriptorMetadata[descriptor.id]

    const restrictions: AnonCredsProofRequestRestriction[] = credentialMeta.map((credentialMeta) => {
      if (credentialMeta.anonCredsTags.anonCredsMethodName === 'w3c') {
        return {
          schema_name: credentialMeta.anonCredsTags.anonCredsSchemaName,
        } as AnonCredsProofRequestRestriction
      }

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
          const predicateReferent = `${referent}_${predicateReferentIndex++}`
          anonCredsProofRequest.requested_predicates[predicateReferent] = {
            name: propertyName,
            p_type: predicateType,
            p_value: predicateValue,
            restrictions,
            non_revoked: requiresRevocationStatus ? nonRevokedInterval : undefined,
            // descriptorId: descriptor.id,
          }
        }
      } else {
        if (!anonCredsProofRequest.requested_attributes[referent]) {
          anonCredsProofRequest.requested_attributes[referent] = {
            names: [propertyName],
            restrictions,
            non_revoked: requiresRevocationStatus ? nonRevokedInterval : undefined,
            // descriptorId: descriptor.id,
          }
        } else {
          const names = anonCredsProofRequest.requested_attributes[referent].names ?? []
          anonCredsProofRequest.requested_attributes[referent].names = [...names, propertyName]
        }
      }
    }
  }

  return anonCredsProofRequest
}

export const getDescriptorMetadata = (credentialsForRequest: DifPexCredentialsForRequest) => {
  const descriptorMetadata: DescriptorMetadata = {}

  for (const requestedAttribute of Object.values(credentialsForRequest.requirements)) {
    for (const entry of requestedAttribute.submissionEntry) {
      const inputDescriptorId = entry.inputDescriptorId

      const recordsWithMetadata = entry.verifiableCredentials.map((submissionEntryCredential) => {
        if (
          submissionEntryCredential.claimFormat !== ClaimFormat.LdpVc &&
          submissionEntryCredential.claimFormat !== ClaimFormat.JwtVc
        ) {
          throw new Error(`Unsupported credential type. ${submissionEntryCredential.claimFormat}`)
        }

        const record = submissionEntryCredential.credentialRecord as W3cCredentialRecord
        const types = record.getTags().types
        const credentialType =
          Array.isArray(types) && types.length > 1 ? types[1] : Array.isArray(types) ? types[0] : types
        const anonCredsTags = getAnonCredsTagsFromRecord(record)

        if (!anonCredsTags) {
          // For non-AnonCreds W3C credentials, create synthetic tags using credential type
          const typeString = typeof credentialType === 'string' ? credentialType : String(credentialType)
          const syntheticTags: AnonCredsCredentialTags = {
            anonCredsCredentialDefinitionId: typeString, // Use type as identifier
            anonCredsSchemaId: typeString,
            anonCredsLinkSecretId: 'synthetic',
            anonCredsMethodName: 'w3c',
            anonCredsSchemaName: typeString,
            anonCredsSchemaVersion: '1.0',
            anonCredsSchemaIssuerId: 'unknown',
          }
          return { record, anonCredsTags: syntheticTags }
        }

        return { record, anonCredsTags }
      })

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

/**
 * Create AnonCreds credentials for proof request directly from descriptor metadata
 * This is used for W3C credentials that don't have AnonCreds backing
 */
export const createAnonCredsCredentialsFromDescriptorMetadata = (
  anonCredsProofRequest: DifPexAnonCredsProofRequest,
  descriptorMetadata: DescriptorMetadata,
  fullCredentials: GenericCredentialExchangeRecord[]
): AnonCredsCredentialsForProofRequest => {
  const attributes: AnonCredsCredentialsForProofRequest['attributes'] = {}
  const predicates: AnonCredsCredentialsForProofRequest['predicates'] = {}

  const w3cRecordToExchangeRecord = new Map<string, GenericCredentialExchangeRecord>()
  fullCredentials.forEach((credExRecord) => {
      w3cRecordToExchangeRecord.set(credExRecord.id, credExRecord)
  })

  for (const [referent, requestedAttribute] of Object.entries(anonCredsProofRequest.requested_attributes)) {
    const descriptorId = requestedAttribute.descriptorId
    if (!descriptorId) continue

    const credentialsForDescriptor = descriptorMetadata[descriptorId] || []

    attributes[referent] = credentialsForDescriptor.map((credMeta) => {
      const exchangeRecord = w3cRecordToExchangeRecord.get(credMeta.record.id)
      const credentialId = exchangeRecord?.id || credMeta.record.id
      let attributes = credMeta.record.firstCredential.credentialSubject as any
      if (attributes?.claims && typeof attributes.claims === 'object') {
        attributes = attributes.claims
      }

      return {
        credentialId: credentialId,
        revealed: true,
        credentialInfo: {
          credentialId: credentialId,
          attributes: attributes as Record<string, string>,
          schemaId: credMeta.anonCredsTags.anonCredsSchemaId,
          credentialDefinitionId: credMeta.anonCredsTags.anonCredsCredentialDefinitionId,
          revocationRegistryId: credMeta.anonCredsTags.anonCredsRevocationRegistryId ?? null,
          credentialRevocationId: credMeta.anonCredsTags.anonCredsCredentialRevocationId ?? null,
          methodName: credMeta.anonCredsTags.anonCredsMethodName,
          linkSecretId: credMeta.anonCredsTags.anonCredsLinkSecretId,
          createdAt: credMeta.record.createdAt ?? new Date(),
          updatedAt: credMeta.record.updatedAt ?? new Date(),
        },
      }
    })
  }
  for (const [referent, requestedPredicate] of Object.entries(anonCredsProofRequest.requested_predicates)) {
    const descriptorId = requestedPredicate.descriptorId
    if (!descriptorId) continue

    const credentialsForDescriptor = descriptorMetadata[descriptorId] || []

    predicates[referent] = credentialsForDescriptor.map((credMeta) => {
      const exchangeRecord = w3cRecordToExchangeRecord.get(credMeta.record.id)
      const credentialId = exchangeRecord?.id || credMeta.record.id
      let attributes = credMeta.record.firstCredential.credentialSubject as any
      if (attributes?.claims && typeof attributes.claims === 'object') {
        attributes = attributes.claims
      }

      return {
        credentialId: credentialId,
        credentialInfo: {
          credentialId: credentialId,
          attributes: attributes as Record<string, string>,
          schemaId: credMeta.anonCredsTags.anonCredsSchemaId,
          credentialDefinitionId: credMeta.anonCredsTags.anonCredsCredentialDefinitionId,
          revocationRegistryId: credMeta.anonCredsTags.anonCredsRevocationRegistryId ?? null,
          credentialRevocationId: credMeta.anonCredsTags.anonCredsCredentialRevocationId ?? null,
          methodName: credMeta.anonCredsTags.anonCredsMethodName,
          linkSecretId: credMeta.anonCredsTags.anonCredsLinkSecretId,
          createdAt: credMeta.record.createdAt ?? new Date(),
          updatedAt: credMeta.record.updatedAt ?? new Date(),
        },
      }
    })
  }

  return { attributes, predicates }
}

/**
 * The matches returned by our artificial anonCredsProofRequest could contain matches,
 * which are not valid thus we need to filter them out
 */
export const filterInvalidProofRequestMatches = (
  anonCredsCredentialsForRequest: AnonCredsCredentialsForProofRequest,
  descriptorMetadata: DescriptorMetadata
) => {
  anonCredsCredentialsForRequest.attributes = Object.fromEntries(
    Object.entries(anonCredsCredentialsForRequest.attributes).map(([referent, matches]) => {
      const descriptorMeta = descriptorMetadata[referent]
      const validCredentialsForReferent = descriptorMeta.map((meta) => meta.record.id)
      const validMatches = matches.filter((match) => validCredentialsForReferent.includes(match.credentialId))
      return [referent, validMatches]
    })
  )

  anonCredsCredentialsForRequest.predicates = Object.fromEntries(
    Object.entries(anonCredsCredentialsForRequest.predicates).map(([_referent, matches]) => {
      const referent = _referent.split('_').slice(0, -1).join('_')
      const descriptorMeta = descriptorMetadata[referent]
      const validCredentialsForReferent = descriptorMeta.map((meta) => meta.record.id)
      const validMatches = matches.filter((match) => validCredentialsForReferent.includes(match.credentialId))
      return [_referent, validMatches]
    })
  )

  return anonCredsCredentialsForRequest
}
