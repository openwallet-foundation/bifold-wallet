import { AnonCredsProof, AnonCredsProofRequest } from '@credo-ts/anoncreds'
import { Agent, ProofExchangeRecord, ProofState } from '@credo-ts/core'

import { BifoldAgent } from '../types/agent'
import { ProofMetadata } from '../types/metadata'
import {
  CredentialSharedProofData,
  GroupedSharedProofData,
  GroupedSharedProofDataItem,
  ParsedAnonCredsProof,
} from '../types/proof'

/*
 * Extract identifiers from indy proof
 * */
export const getProofIdentifiers = (proof: AnonCredsProof, proofIndex: number) => {
  const identifiers = proof.identifiers[proofIndex]
  if (!identifiers) {
    throw new Error('Invalid indy proof data')
  }
  return identifiers
}

/*
 * Process anoncreds proof and return
 *  - shared attributes
 *  - shared attribute groups
 *  - resolved predicates
 *  - missing attributes
 *  - missing attribute groups
 *  - unresolved predicates
 * */
export const parseAnonCredsProof = (request: AnonCredsProofRequest, proof: AnonCredsProof): ParsedAnonCredsProof => {
  const result = new ParsedAnonCredsProof()

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
      const shared = proof.requested_proof.revealed_attr_groups?.[referent]
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
    // @ts-ignore Mistake in Credo type definition
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

/*
 * Group parsed indy proof data ( returned from `parseIndyProof`) by credential definition id
 * */
export const groupSharedProofDataByCredential = (data: ParsedAnonCredsProof): GroupedSharedProofData => {
  const result: GroupedSharedProofData = new Map<string, GroupedSharedProofDataItem>()
  for (const item of data.sharedAttributes) {
    if (!result.has(item.identifiers.cred_def_id)) {
      result.set(item.identifiers.cred_def_id, {
        data: new CredentialSharedProofData(),
        identifiers: item.identifiers,
      })
    }
    result.get(item.identifiers.cred_def_id)?.data.sharedAttributes.push(item)
  }
  for (const item of data.sharedAttributeGroups) {
    if (!result.has(item.identifiers.cred_def_id)) {
      result.set(item.identifiers.cred_def_id, {
        data: new CredentialSharedProofData(),
        identifiers: item.identifiers,
      })
    }
    result.get(item.identifiers.cred_def_id)?.data.sharedAttributeGroups.push(item)
  }
  for (const item of data.resolvedPredicates) {
    if (!result.has(item.identifiers.cred_def_id)) {
      result.set(item.identifiers.cred_def_id, {
        data: new CredentialSharedProofData(),
        identifiers: item.identifiers,
      })
    }
    result.get(item.identifiers.cred_def_id)?.data.resolvedPredicates.push(item)
  }
  return result
}

/*
 * Retrieve proof details from Credo record
 * */
export const getProofData = async (agent: BifoldAgent, recordId: string): Promise<ParsedAnonCredsProof | undefined> => {
  const data = await agent.proofs.getFormatData(recordId)
  if (data.request?.anoncreds && data.presentation?.anoncreds) {
    return parseAnonCredsProof(data.request.anoncreds, data.presentation.anoncreds)
  } else if (data.request?.indy && data.presentation?.indy) {
    return parseAnonCredsProof(data.request.indy, data.presentation.indy)
  }

  return undefined
}

/*
 * Check if a presentation received
 * */
export const isPresentationReceived = (record: ProofExchangeRecord) => {
  return record.state === ProofState.PresentationReceived || record.state === ProofState.Done
}

/*
 * Check if a presentation failed
 * */
export const isPresentationFailed = (record: ProofExchangeRecord) => {
  return record.state === ProofState.Abandoned
}

/*
 * Mark Proof record as viewed
 * */
export const markProofAsViewed = async (agent: Agent, record: ProofExchangeRecord) => {
  record.metadata.set(ProofMetadata.customMetadata, { ...record.metadata.data.customMetadata, details_seen: true })
  return agent.proofs.update(record)
}

/*
 * Add template reference to Proof Exchange record
 * */
export const linkProofWithTemplate = async (agent: Agent, record: ProofExchangeRecord, templateId: string) => {
  record.metadata.set(ProofMetadata.customMetadata, {
    ...record.metadata.data.customMetadata,
    proof_request_template_id: templateId,
  })
  return agent.proofs.update(record)
}
