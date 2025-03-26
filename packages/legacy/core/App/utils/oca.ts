import { CredentialExchangeRecord } from '@credo-ts/core'
import { AnonCredsProofRequestTemplatePayloadData, CredentialSharedProofData } from '@hyperledger/aries-bifold-verifier'
import {
  Attribute,
  CredentialOverlay,
  Field,
  OCABundleResolveAllParams,
  OCABundleResolverType,
  Predicate,
} from '@hyperledger/aries-oca/build/legacy'
import { W3cCredentialDisplay } from '../modules/openid/types'
import { BrandingOverlay } from '@hyperledger/aries-oca'

export const buildFieldsFromAnonCredsCredential = (credential: CredentialExchangeRecord): Array<Field> => {
  return credential?.credentialAttributes?.map((attr) => new Attribute(attr)) || []
}

export type FiledExt = {
  field: Attribute
  attribute_name: string
}

export const getAttributeField = (display: W3cCredentialDisplay, searchKey: string): FiledExt | undefined => {
  let attributeName: string = 'Unknown'
  let attributeValue: string | number | null = 'Unknown'

  for (const [key, value] of Object.entries(display.attributes)) {
    let formattedValue: string | number | null

    if (searchKey === key) {
      if (typeof value === 'object' && value !== null) {
        formattedValue = JSON.stringify(value) // Convert object to string
      } else {
        formattedValue = value as string | number | null
      }

      attributeName = key
      attributeValue = formattedValue
    }
  }

  //Now check credentialSubject for attributeName mapping
  const credentialSubject = display.credentialSubject

  if (credentialSubject) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    for (const [key, value] of Object.entries(credentialSubject)) {
      if (key !== searchKey) continue
      if (!value) continue
      const { display } = value
      const { name } = display[0]
      attributeName = name
    }
  }

  return {
    field: new Attribute({
      name: attributeName,
      value: attributeValue as string | number | null,
      mimeType: typeof attributeValue === 'number' ? 'text/number' : 'text/plain',
    }),
    attribute_name: searchKey,
  }
}

export const buildFieldsFromW3cCredsCredential = (
  display: W3cCredentialDisplay,
  filterByAttributes?: string[]
): Array<Field> => {
  return (
    Object.entries(display.attributes)
      .filter(([key]) => key !== 'id')
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      .map(([key, value]) => getAttributeField(display, key))
      .filter((field) => field !== undefined)
      .filter((field: FiledExt) => (filterByAttributes ? filterByAttributes.includes(field.attribute_name) : true))
      .map((fld) => fld.field) || []
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
