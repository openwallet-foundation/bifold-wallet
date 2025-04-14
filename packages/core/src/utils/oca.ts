import { CredentialExchangeRecord } from '@credo-ts/core'
import { AnonCredsProofRequestTemplatePayloadData, CredentialSharedProofData } from '@bifold/verifier'
import {
  Attribute,
  CredentialOverlay,
  Field,
  OCABundleResolveAllParams,
  OCABundleResolverType,
  Predicate,
} from '@bifold/oca/build/legacy'
import { W3cCredentialDisplay } from '../modules/openid/types'
import { BrandingOverlay } from '@bifold/oca'

export const buildFieldsFromAnonCredsCredential = (credential: CredentialExchangeRecord): Array<Field> => {
  return credential?.credentialAttributes?.map((attr) => new Attribute(attr)) || []
}

export const buildFieldsFromW3cCredsCredential = (value: W3cCredentialDisplay): Array<Field> => {
  return (
    Object.entries(value.attributes)
      .filter(([key]) => key !== 'id')
      .map(([key, value]) => {
        let formattedValue: string | number | null

        if (typeof value === 'object' && value !== null) {
          formattedValue = JSON.stringify(value) // Convert object to string
        } else {
          formattedValue = value as string | number | null
        }

        return new Attribute({
          name: key,
          value: formattedValue,
          mimeType: typeof value === 'number' ? 'text/number' : 'text/plain',
        })
      }) || []
  )
}

export const buildFieldsFromAnonCredsProofRequestTemplate = (
  data: AnonCredsProofRequestTemplatePayloadData
): Array<Field> => {
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

export const buildFieldsFromSharedAnonCredsProof = (data: CredentialSharedProofData): Array<Field> => {
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
        satisfied: true,
      })
    )
  }
  return fields
}

export const buildOverlayFromW3cCredential = async ({
  credentialDisplay,
  language,
  resolver,
}: {
  credentialDisplay: W3cCredentialDisplay
  language: string
  resolver: OCABundleResolverType
}): Promise<CredentialOverlay<BrandingOverlay>> => {
  const params: OCABundleResolveAllParams = {
    identifiers: {
      schemaId: '',
      credentialDefinitionId: credentialDisplay.id,
    },
    meta: {
      alias: credentialDisplay.display.issuer.name,
      credConnectionId: undefined,
      credName: credentialDisplay.display.name,
    },
    attributes: buildFieldsFromW3cCredsCredential(credentialDisplay),
    language,
  }

  const bundle = await resolver.resolveAllBundles(params)

  return {
    ...(bundle as CredentialOverlay<BrandingOverlay>),
    presentationFields: buildFieldsFromW3cCredsCredential(credentialDisplay),
  }
}
