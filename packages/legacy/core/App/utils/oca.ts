import { CredentialExchangeRecord } from '@aries-framework/core'
import { legacy } from '@hyperledger/aries-oca'

import { CredentialSharedProofData, AnonCredsProofRequestTemplatePayloadData } from '../../verifier'

export const buildFieldsFromAnonCredsCredential = (credential: CredentialExchangeRecord): Array<legacy.Field> => {
  return credential?.credentialAttributes?.map((attr) => new legacy.Attribute(attr)) || []
}

export const buildFieldsFromAnonCredsProofRequestTemplate = (
  data: AnonCredsProofRequestTemplatePayloadData
): Array<legacy.Field> => {
  const fields = []
  if (data.requestedAttributes) {
    for (const item of data.requestedAttributes) {
      if (item.name) {
        fields.push(new legacy.Attribute({ name: item.name, value: null, ...item }))
      }
      if (item.names) {
        for (const name of item.names) {
          fields.push(new legacy.Attribute({ name, value: null, ...item }))
        }
      }
    }
  }
  if (data.requestedPredicates) {
    for (const item of data.requestedPredicates) {
      fields.push(
        new legacy.Predicate({
          pType: item.predicateType,
          pValue: item.predicateValue,
          ...item,
        })
      )
    }
  }
  return fields
}

export const buildFieldsFromSharedAnonCredsProof = (data: CredentialSharedProofData): Array<legacy.Field> => {
  const fields = []
  for (const attribute of data.sharedAttributes) {
    fields.push(
      new legacy.Attribute({
        name: attribute.name,
        value: attribute.value,
      })
    )
  }
  for (const attributesGroup of data.sharedAttributeGroups) {
    for (const attribute of attributesGroup.attributes) {
      fields.push(
        new legacy.Attribute({
          name: attribute.name,
          value: attribute.value,
        })
      )
    }
  }
  for (const predicate of data.resolvedPredicates) {
    fields.push(
      new legacy.Predicate({
        name: predicate.name,
        pType: predicate.predicateType,
        pValue: predicate.predicateValue,
      })
    )
  }
  return fields
}
