import { IndyProof, IndyProofRequest } from 'indy-sdk-react-native'

export interface MissingAttribute {
  name: string
}

export interface SharedAttribute {
  name: string
  value: string
}

export interface ResolvedPredicate {
  name: string
  predicateType: string
  predicateValue: number
}

export interface ParsedIndyProof {
  sharedAttribute: Array<SharedAttribute>
  sharedAttributeGroups: Array<Array<SharedAttribute>>
  resolvedPredicates: Array<ResolvedPredicate>
  unresolvedAttributes: Array<MissingAttribute>
  unresolvedAttributeGroups: Array<Array<MissingAttribute>>
  unresolvedPredicates: Array<ResolvedPredicate>
}

export const parseIndyProof = (request: IndyProofRequest, proof: IndyProof) => {
  const sharedAttribute: Array<SharedAttribute> = []
  const sharedAttributeGroups: Array<Array<SharedAttribute>> = []
  const resolvedPredicates: Array<ResolvedPredicate> = []
  const unresolvedAttributes: Array<MissingAttribute> = []
  const unresolvedAttributeGroups: Array<Array<MissingAttribute>> = []
  const unresolvedPredicates: Array<ResolvedPredicate> = []

  for (const [referent, requested_attribute] of Object.entries(request.requested_attributes)) {
    if (requested_attribute.name) {
      const shared = proof.requested_proof.revealed_attrs[referent]
      if (shared) {
        sharedAttribute.push({
          name: requested_attribute.name,
          value: shared.raw,
        })
      } else {
        unresolvedAttributes.push({
          name: requested_attribute.name,
        })
      }
    }

    if (requested_attribute.names) {
      const shared = proof.requested_proof.revealed_attr_groups[referent]
      if (shared) {
        sharedAttributeGroups.push(
          Object.entries(shared.values).map(([name, value]) => ({
            name,
            value: value.raw,
          }))
        )
      } else {
        unresolvedAttributeGroups.push(requested_attribute.names.map((name) => ({ name })))
      }
    }
  }

  for (const [referent, requestedPredicate] of Object.entries(request.requested_predicates)) {
    const shared = proof.requested_proof.requested_predicates[referent]
    if (shared) {
      resolvedPredicates.push({
        name: requestedPredicate.name,
        predicateType: requestedPredicate.p_type,
        predicateValue: requestedPredicate.p_value,
      })
    } else {
      unresolvedPredicates.push({
        name: requestedPredicate.name,
        predicateType: requestedPredicate.p_type,
        predicateValue: requestedPredicate.p_value,
      })
    }
  }

  return {
    sharedAttribute,
    sharedAttributeGroups,
    resolvedPredicates,
    unresolvedAttributes,
    unresolvedAttributeGroups,
    unresolvedPredicates,
  }
}
