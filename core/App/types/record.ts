import { RequestedAttribute, RequestedPredicate } from '@aries-framework/core'

export interface Field {
  name: string | null
  mimeType?: string
  revoked?: boolean
  credentialId?: string
}

export interface Attribute extends Field {
  value: RequestedAttribute | string | null
}

export interface Predicate extends Field {
  value: RequestedPredicate | number | null
  type: string
}
