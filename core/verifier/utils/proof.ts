import { Agent, ProofExchangeRecord, ProofIdentifier, ProofState } from '@aries-framework/core'
import { IndyProof, IndyProofRequest } from 'indy-sdk-react-native'

export interface MissingAttribute {
  name: string
}

export interface SharedAttribute {
  name: string
  value: string
  identifiers: ProofIdentifier
}

export interface SharedGroupedAttribute {
  name: string
  value: string
}

export interface SharedAttributesGroup {
  attributes: Array<SharedGroupedAttribute>
  identifiers: ProofIdentifier
}

export interface ResolvedPredicate {
  name: string
  predicateType: string
  predicateValue: number
  identifiers: ProofIdentifier
}

export interface UnresolvedPredicate {
  name: string
  predicateType: string
  predicateValue: number
}

export class ParsedIndyProof {
  public sharedAttributes: Array<SharedAttribute>
  public sharedAttributeGroups: Array<SharedAttributesGroup>
  public resolvedPredicates: Array<ResolvedPredicate>
  public unresolvedAttributes: Array<MissingAttribute>
  public unresolvedAttributeGroups: Array<Array<MissingAttribute>>
  public unresolvedPredicates: Array<UnresolvedPredicate>

  public constructor() {
    this.sharedAttributes = []
    this.sharedAttributeGroups = []
    this.resolvedPredicates = []
    this.unresolvedAttributes = []
    this.unresolvedAttributeGroups = []
    this.unresolvedPredicates = []
  }
}

/*
 * Extract identifiers from indy proof
 * */
const getProofIdentifiers = (proof: IndyProof, proofIndex: number): ProofIdentifier => {
  const identifiers = proof.identifiers[proofIndex]
  if (!identifiers) {
    throw new Error('Invalid indy proof data')
  }
  return {
    schemaId: identifiers.schema_id,
    credentialDefinitionId: identifiers.cred_def_id,
    revocationRegistryId: identifiers.rev_reg_id,
    timestamp: identifiers.timestamp,
  }
}

/*
 * Process indy proof and return
 *  - shared attributes
 *  - shared attribute groups
 *  - resolved predicates
 *  - missing attributes
 *  - missing attribute groups
 *  - unresolved predicates
 * */
export const parseIndyProof = (request: IndyProofRequest, proof: IndyProof): ParsedIndyProof => {
  const result = new ParsedIndyProof()

  for (const [referent, requested_attribute] of Object.entries(request.requested_attributes)) {
    if (requested_attribute.name) {
      const shared = proof.requested_proof.revealed_attrs[referent]
      if (shared) {
        const identifiers = getProofIdentifiers(proof, shared.sub_proof_index)
        result.sharedAttributes.push({
          name: requested_attribute.name,
          value: shared.raw,
          identifiers,
        })
      } else {
        result.unresolvedAttributes.push({
          name: requested_attribute.name,
        })
      }
    }

    if (requested_attribute.names) {
      const shared = proof.requested_proof.revealed_attr_groups[referent]
      if (shared) {
        const attributes = Object.entries(shared.values).map(([name, value]) => ({
          name,
          value: value.raw,
        }))
        const identifiers = getProofIdentifiers(proof, shared.sub_proof_index)
        result.sharedAttributeGroups.push({
          attributes,
          identifiers,
        })
      } else {
        result.unresolvedAttributeGroups.push(requested_attribute.names.map((name) => ({ name })))
      }
    }
  }

  for (const [referent, requestedPredicate] of Object.entries(request.requested_predicates)) {
    // @ts-ignore Mistake in AFJ type definition
    const shared = proof.requested_proof.predicates[referent]
    if (shared) {
      const identifiers = getProofIdentifiers(proof, shared.sub_proof_index)
      result.resolvedPredicates.push({
        name: requestedPredicate.name,
        predicateType: requestedPredicate.p_type,
        predicateValue: requestedPredicate.p_value,
        identifiers,
      })
    } else {
      result.unresolvedPredicates.push({
        name: requestedPredicate.name,
        predicateType: requestedPredicate.p_type,
        predicateValue: requestedPredicate.p_value,
      })
    }
  }

  return result
}

export class CredentialSharedProofData {
  public sharedAttributes: Array<SharedAttribute>
  public sharedAttributeGroups: Array<SharedAttributesGroup>
  public resolvedPredicates: Array<ResolvedPredicate>

  public constructor() {
    this.sharedAttributes = []
    this.sharedAttributeGroups = []
    this.resolvedPredicates = []
  }
}

export type GroupedSharedProofDataItem = { data: CredentialSharedProofData; identifiers: ProofIdentifier }
export type GroupedSharedProofData = Map<string, GroupedSharedProofDataItem>

/*
 * Group parsed indy proof data ( returned from `parseIndyProof`) by credential definition id
 * */
export const groupSharedProofDataByCredential = (data: ParsedIndyProof): GroupedSharedProofData => {
  const result: GroupedSharedProofData = new Map<string, GroupedSharedProofDataItem>()
  for (const item of data.sharedAttributes) {
    if (!result.has(item.identifiers.credentialDefinitionId)) {
      result.set(item.identifiers.credentialDefinitionId, {
        data: new CredentialSharedProofData(),
        identifiers: item.identifiers,
      })
    }
    result.get(item.identifiers.credentialDefinitionId)?.data.sharedAttributes.push(item)
  }
  for (const item of data.sharedAttributeGroups) {
    if (!result.has(item.identifiers.credentialDefinitionId)) {
      result.set(item.identifiers.credentialDefinitionId, {
        data: new CredentialSharedProofData(),
        identifiers: item.identifiers,
      })
    }
    result.get(item.identifiers.credentialDefinitionId)?.data.sharedAttributeGroups.push(item)
  }
  for (const item of data.resolvedPredicates) {
    if (!result.has(item.identifiers.credentialDefinitionId)) {
      result.set(item.identifiers.credentialDefinitionId, {
        data: new CredentialSharedProofData(),
        identifiers: item.identifiers,
      })
    }
    result.get(item.identifiers.credentialDefinitionId)?.data.resolvedPredicates.push(item)
  }
  return result
}

/*
 * Retrieve proof details from AFJ record
 * */
export const getProofData = async (agent: Agent, recordId: string): Promise<ParsedIndyProof | undefined> => {
  const data = await agent.proofs.getFormatData(recordId)
  if (data.request?.indy && data.presentation?.indy) {
    return parseIndyProof(data.request.indy, data.presentation.indy)
  }
  return undefined
}

/*
 * Check if a presentation received
 * */
export const isPresentationReceived = (record: ProofExchangeRecord) => {
  return record.state === ProofState.PresentationReceived || record.state === ProofState.Done
}
