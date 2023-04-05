import { CredentialExchangeRecord } from '@aries-framework/core'

import { CredentialSharedProofData, IndyProofRequestTemplatePayloadData } from '../../verifier'
import { Attribute, Field, Predicate } from '../types/record'

export const buildFieldsFromIndyCredential = (credential: CredentialExchangeRecord): Array<Field> => {
  return credential?.credentialAttributes?.map((attr) => new Attribute(attr)) || []
}

export const buildFieldsFromIndyProofRequestTemplate = (data: IndyProofRequestTemplatePayloadData): Array<Field> => {
  const fields = []
  if (data.requestedAttributes) {
    for (const item of data.requestedAttributes) {
      if (item.name) {
        fields.push(new Attribute({ name: item.name, value: null, ...item }))
      }
      if (item.names) {
        for (const name of item.names) {
          fields.push(new Attribute({ name, value: null, ...item }))
        }
      }
    }
  }
  if (data.requestedPredicates) {
    for (const item of data.requestedPredicates) {
      fields.push(
        new Predicate({
          pType: item.predicateType,
          pValue: item.predicateValue,
          ...item,
        })
      )
    }
  }
  return fields
}

export const buildFieldsFromSharedIndyProof = (data: CredentialSharedProofData): Array<Field> => {
  const fields = []
  for (const attribute of data.sharedAttributes) {
    fields.push(
      new Attribute({
        name: attribute.name,
        value: attribute.value,
      })
    )
  }
  for (const attributesGroup of data.sharedAttributeGroups) {
    for (const attribute of attributesGroup.attributes) {
      fields.push(
        new Attribute({
          name: attribute.name,
          value: attribute.value,
        })
      )
    }
  }
  for (const predicate of data.resolvedPredicates) {
    fields.push(
      new Predicate({
        name: predicate.name,
        pType: predicate.predicateType,
        pValue: predicate.predicateValue,
      })
    )
  }
  return fields
}
