export interface Field {
  name: string | null
  mimeType?: string
  revoked?: boolean
  credentialId?: string
}

export interface Attribute extends Field {
  value: string | number | null
}

export interface Predicate extends Field {
  pValue: string | number | null
  pType: string
}
